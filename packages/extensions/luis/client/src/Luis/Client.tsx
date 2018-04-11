import { ServiceBase } from 'luis-apis/lib/api/serviceBase';
import Apps from 'luis-apis/lib/api/apps/apps';
import Intents from 'luis-apis/lib/api/models/intents';
import { LuisAppInfo } from '../Models/LuisAppInfo';
import { Example, EntityLabel, ExampleLabelObject, AddLabelParams } from 'luis-apis/lib/api/examples';
import { AppInfo } from './AppInfo';
import { IntentInfo } from './IntentInfo';
import { LuisResponse } from './LuisResponse';

const DefaultVersion = '0.1';

// TODO: This client should cache the info that doesn't
// change frequently per app, so that we wouldn't re-query
// the service on every "inspect" event
class LuisClient {

  private appsService: Apps;
  private intentsService: Intents;
  private exampleService: Example;
  private luisAppInfo: LuisAppInfo;

  constructor(luisAppInfo: LuisAppInfo) {
    this.luisAppInfo = luisAppInfo;
    this.appsService = new Apps();
    this.intentsService = new Intents();
    this.exampleService = new Example();
  }

  getLoggedInUserApps(): Promise<any> {
    this.configureClient();
    return this.appsService.getApplicationsList();
  }

  async getApplicationInfo(): Promise<AppInfo> {
    this.configureClient();
    let r = await this.appsService.getApplicationInfo({ appId: this.luisAppInfo.appId });
    let appInfo: AppInfo;
    if (r.status === 401) {
      appInfo = {
        authorized: false,
        activeVersion: '',
        name: ''
      };
    } else {
      appInfo = await r.json();
      appInfo.authorized = true;
    }
    return appInfo;
  }

  async getApplicationIntents(appId: string, appInfo: AppInfo): Promise<IntentInfo[]> {
    this.configureClient();
    let r = await this.intentsService.getVersionIntentList({ appId: appId, versionId: appInfo.activeVersion });
    let intents = await r.json();
    return intents.map((i: any) => i as IntentInfo);
  }

  reassignIntent(appId: string, appInfo: AppInfo, luisResponse: LuisResponse, newIntent: string): Promise<void> {
    this.configureClient();
    let exampleLabelObject: ExampleLabelObject = {
      text: luisResponse.query,
      intentName: newIntent,
      entityLabels: luisResponse.entities.map(e => {
                      return {
                        entityName: e.entity,
                        startCharIndex: e.startIndex,
                        endCharIndex: e.endIndex
                      };
                    })
    };

    let addLabelParapms: AddLabelParams = {
      appId: appId,
      versionId: appInfo.activeVersion || DefaultVersion
    };

    return this.exampleService.addLabel(addLabelParapms, exampleLabelObject);
  }

  private configureClient() {
    // TODO: It's annoying that the settings are singleton and static
    // This makes it hard to cache multiple clients for different apps
    // We should consider updating the Client SDK to make the configs per service
    ServiceBase.config = {
      endpointBasePath: this.luisAppInfo.baseUri,
      authoringKey: this.luisAppInfo.key,
    };
  }
}

export default LuisClient;