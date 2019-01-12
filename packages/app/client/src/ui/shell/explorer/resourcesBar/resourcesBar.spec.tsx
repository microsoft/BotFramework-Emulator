import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { combineReducers, createStore } from "redux";
import { ResourcesBarContainer } from "./resourcesBarContainer";
import { ResourcesBar } from "./resourcesBar";
import { ServiceTypes } from "botframework-config/lib/schema";
import { resources } from "../../../../data/reducer/resourcesReducer";
import { bot } from "../../../../data/reducer/bot";
import { BotConfigWithPathImpl } from "@bfemulator/sdk-shared";
import {
  chatFilesUpdated,
  transcriptsUpdated
} from "../../../../data/action/resourcesAction";
import { load, setActive } from "../../../../data/action/botActions"; // important
const mockClass = class {};
const mockStore = createStore(combineReducers({ resources, bot }), {});
jest.mock(
  "../../../dialogs/resourcesSettings/resourcesSettings.scss",
  () => ({})
);
jest.mock("./resourcesBar.scss", () => ({}));
jest.mock("../explorerStyles.scss", () => ({}));
jest.mock("../servicePane/servicePane.scss", () => ({}));
jest.mock("../resourceExplorer/resourceExplorer.scss", () => ({}));
jest.mock("../../../dialogs", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  },
  get ResourcesSettingsContainer() {
    return mockClass;
  }
}));
describe("The ServicesExplorer component should", () => {
  let parent;
  let node;
  let mockChat;
  let mockTranscript;
  beforeEach(() => {
    const mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "padlock": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockChat = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: "the/file/path/chat.chat",
      name: "testChat"
    } as any);

    mockTranscript = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: "the/file/path/transcript.transcript",
      name: "testTranscript"
    } as any);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockStore.dispatch(transcriptsUpdated([mockTranscript]));
    mockStore.dispatch(chatFilesUpdated([mockChat]));
    parent = mount(
      <Provider store={mockStore}>
        <ResourcesBarContainer />
      </Provider>
    );
    node = parent.find(ResourcesBar);
  });

  it("should render deeply", () => {
    expect(parent.find(ResourcesBarContainer)).not.toBe(null);
    expect(node).not.toBe(null);
  });
});
