import { SharedConstants } from "@bfemulator/app-shared";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";
import { ServiceTypes } from "botframework-config/lib/schema";
import { registerCommands } from "./connectedServiceCommands";

const mockServiceTypes = ServiceTypes;
jest.mock("../services/luisApiService", () => ({
  LuisApi: {
    getServices: function*() {
      yield { label: "Retrieving luis models", progress: 50 };
      return { services: [{ type: mockServiceTypes.Luis }] };
    }
  }
}));

jest.mock("../services/qnaApiService", () => ({
  QnaApiService: {
    getKnowledgeBases: function*() {
      yield { label: "Retrieving knowledge bases", progress: 50 };
      return { services: [{ type: mockServiceTypes.QnA }] };
    }
  }
}));

jest.mock("../services/storageAccountApiService", () => ({
  StorageAccountApiService: {
    getBlobStorageServices: function*() {
      yield { label: "Retrieving Blob Containers", progress: 50 };
      return { services: [{ type: mockServiceTypes.BlobStorage }] };
    }
  }
}));

jest.mock("../main", () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true
    },
    browserWindow: {}
  }
}));
const mockCommandRegistry = new CommandRegistryImpl();
registerCommands(mockCommandRegistry);

describe("The connected service commands", () => {
  it("should retrieve luis models when the ServiceTypes.Luis is specified", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.ConnectedService.GetConnectedServicesByType
    );

    const result = await handler("", mockServiceTypes.Luis);
    expect(result.services[0].type).toBe(mockServiceTypes.Luis);
  });

  it("should retrieve knowledge bases when the ServiceTypes.QnA is specified", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.ConnectedService.GetConnectedServicesByType
    );

    const result = await handler("", mockServiceTypes.QnA);
    expect(result.services[0].type).toBe(mockServiceTypes.QnA);
  });

  it("should retrieve Blob Containers when the ServiceTypes.BlobStorage is specified", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.ConnectedService.GetConnectedServicesByType
    );

    const result = await handler("", mockServiceTypes.BlobStorage);
    expect(result.services[0].type).toBe(mockServiceTypes.BlobStorage);
  });

  it("should throw if an unexpected service type is specified", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.ConnectedService.GetConnectedServicesByType
    );
    let error;
    try {
      await handler("", mockServiceTypes.File);
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe(
      `The ServiceTypes ${mockServiceTypes.File} is not a known service type`
    );
  });
});
