import { ServiceCodes } from "@bfemulator/app-shared/built";
import { CosmosDbService } from "botframework-config";
import * as crypto from "crypto";

import {
  AccountIdentifier,
  AzureManagementApiService,
  AzureResource,
  Provider
} from "./azureManagementApiService";

export class CosmosDbApiService {
  public static *getCosmosDbServices(armToken: string): IterableIterator<any> {
    const payload = { services: [], code: ServiceCodes.OK };

    // 1. get a list of subscriptions for the user
    yield { label: "Retrieving subscriptions from Azure…", progress: 10 };
    const subs = yield AzureManagementApiService.getSubscriptions(armToken);
    if (!subs) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }

    // 2. Retrieve a list of database accounts
    yield { label: "Retrieving account data from Azure…", progress: 25 };
    const databaseAccounts: AzureResource[] = yield AzureManagementApiService.getAzureResource(
      armToken,
      subs,
      Provider.CosmosDB,
      AccountIdentifier.CosmosDb
    );
    if (!databaseAccounts) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }

    // 3. Retrieve a list of keys
    yield { label: "Retrieving access keys from Azure…", progress: 45 };
    const keys: string[] = yield AzureManagementApiService.getKeysForAccounts(
      armToken,
      databaseAccounts,
      "2015-04-08",
      "primaryMasterKey"
    );
    if (!keys) {
      payload.code = ServiceCodes.Error;
      return payload;
    }

    // 4. retrieve a list of CosmosDBs
    yield { label: "Retrieving Cosmos DBs from Azure…", progress: 65 };
    const cosmosDbRequests = databaseAccounts.map((account, index) => {
      const req = AzureManagementApiService.getRequestInit(armToken);
      req.headers["x-ms-version"] = "2017-02-22";
      (req.headers as any).Authorization = getAuthorizationTokenUsingMasterKey(
        keys[index]
      );
      return fetch(`https://${account.name}.documents.azure.com/dbs`, req);
    });
    const cosmosDbResponses: Response[] = yield Promise.all(cosmosDbRequests);
    const cosmosDbs = [];
    let i = cosmosDbResponses.length;
    while (i--) {
      const response = cosmosDbResponses[i];
      if (!response.ok) {
        continue;
      }
      const responseJson = yield response.json();
      if (responseJson.Databases || [].length) {
        responseJson.Databases.forEach(db =>
          cosmosDbs.push({ db, account: databaseAccounts[i] })
        );
      }
    }

    // 5. Retrieve a list of collections - please note that this is
    // an endpoint used in the azure portal for retrieving collections.
    // It does not appear to be documented anywhere and was used because
    // the documented API was returning a 401 no matter what params and
    // auth headers where used.
    yield { label: "Retrieving collections from Azure…", progress: 85 };
    const collectionRequests = cosmosDbs.map(info => {
      const { db, account } = info;
      const { id, name, properties, subscriptionId } = account as AzureResource;
      const req = AzureManagementApiService.getRequestInit(armToken);
      const resourceGroup = id.split("/")[4];
      const params = [
        `resourceUrl=${properties.documentEndpoint}dbs/${db._rid}/colls/`,
        `rid=${db._rid}`,
        "rtype=colls",
        `sid=${subscriptionId}`,
        `rg=${resourceGroup}`,
        `dba=${name}`
      ];
      const proxyUrl = `https://main.documentdb.ext.azure.com/api/RuntimeProxy?${params.join(
        "&"
      )}`;
      return fetch(proxyUrl, req);
    });

    const collectionResponses = yield Promise.all(collectionRequests);
    i = collectionResponses.length;
    while (i--) {
      const collectionResponse: Response = collectionResponses[i];
      if (!collectionResponse.ok) {
        continue;
      }
      const { db, account } = cosmosDbs[i];
      const collectionResponseJson = yield collectionResponse.json();
      (collectionResponseJson.DocumentCollections || []).forEach(collection => {
        payload.services.push(buildServiceModel(account, db, collection));
      });
    }
    return payload;
  }
}

function buildServiceModel(
  account: AzureResource,
  cosmosDb: AzureResource,
  collection: { id: string }
): CosmosDbService {
  const service = new CosmosDbService();
  service.database = cosmosDb.id;
  service.collection = collection.id;
  service.endpoint = account.properties.documentEndpoint;
  service.serviceName = service.name = collection.id;
  service.resourceGroup = account.id.split("/")[4];
  service.subscriptionId = account.subscriptionId;
  service.tenantId = account.tenantId;

  return service;
}

function getAuthorizationTokenUsingMasterKey(
  masterKey: string = "",
  resourceId: string = ""
): string {
  const key = Buffer.from(masterKey, "base64");
  const text =
    "get\n" +
    "dbs\n" +
    resourceId +
    "\n" +
    new Date().toUTCString().toLowerCase() +
    "\n" +
    "" +
    "\n";

  const body = Buffer.from(text);
  const signature = crypto
    .createHmac("sha256", key)
    .update(body)
    .digest("base64");

  return encodeURIComponent("type=master&ver=1.0&sig=" + signature);
}
