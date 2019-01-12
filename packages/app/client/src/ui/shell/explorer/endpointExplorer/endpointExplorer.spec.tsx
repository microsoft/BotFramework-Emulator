import { mount } from "enzyme";
import * as React from "react";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import { load, setActive } from "../../../../data/action/botActions";
import {
  openEndpointExplorerContextMenu,
  openEndpointInEmulator
} from "../../../../data/action/endpointServiceActions";
import { bot } from "../../../../data/reducer/bot";
import { EndpointEditorContainer } from "./endpointEditor";
import { EndpointExplorer } from "./endpointExplorer";
import { EndpointExplorerContainer } from "./endpointExplorerContainer";

const mockStore = createStore(combineReducers({ bot }), {});

jest.mock("../../../dialogs", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  }
}));

jest.mock("../servicePane/servicePane.scss", () => ({}));
jest.mock("./endpointExplorer.scss", () => ({}));
jest.mock("./endpointEditor/endpointEditor.scss", () => ({}));
jest.mock("../../../../data/store", () => ({
  get store() {
    return mockStore;
  }
}));

const mockWindow = {
  addEventListener: () => true,
  removeEventListener: () => true
};

let mockBot = {
  name: "TestBot",
  description: "",
  padlock: "",
  services: [
    {
      type: "endpoint",
      appId: "51fc2648-1190-44aa-9559-87b11b1d0014",
      appPassword: "vcxzvcxzvvxczvcxzv",
      endpoint: "https://testbot.botframework.com/api/messagesv3",
      id: "https://testbot.botframework.com/api/messagesv3",
      name: "https://testbot.botframework.com/api/messagesv3"
    },
    {
      type: "abs",
      appId: "51fc2648-1190-44fa-9559-87b11b1d0014",
      id: "142",
      resourceGroup: "555",
      serviceName: "111",
      subscriptionId: "444",
      tenantId: "22"
    }
  ]
};
describe("The EndpointExplorer component should", () => {
  let parent;
  let node;
  let mockDispatch;

  beforeEach(() => {
    mockStore.dispatch(load([mockBot as any]));
    mockStore.dispatch(setActive(mockBot as any));

    parent = mount(
      <Provider store={mockStore}>
        <EndpointExplorerContainer window={mockWindow} />
      </Provider>
    );
    node = parent.find(EndpointExplorer);
    mockDispatch = jest.spyOn(mockStore, "dispatch");
  });

  it("should render deeply", () => {
    expect(parent.find(EndpointExplorerContainer)).not.toBe(null);
    expect(parent.find(EndpointExplorer)).not.toBe(null);
  });

  it("should have the expected functions available in the props", () => {
    const props = node.props();
    expect(typeof props.launchEndpointEditor).toBe("function");
    expect(typeof props.openEndpointInEmulator).toBe("function");
    expect(typeof props.openContextMenuForService).toBe("function");
  });

  it("should dispatch to open the context menu when and item is right clicked on", () => {
    const mockLi = document.createElement("li");
    mockLi.setAttribute("data-index", "0");

    node.instance().onContextMenuOverLiElement(mockLi);
    expect(mockDispatch).toHaveBeenCalledWith(
      openEndpointExplorerContextMenu(EndpointEditorContainer, mockBot
        .services[0] as any)
    );
  });

  it("should dispatch to open a link when a link is clicked", () => {
    const mockLi = document.createElement("li");
    mockLi.setAttribute("data-index", "0");
    node.instance().onLinkClick({ currentTarget: mockLi } as any);

    expect(mockDispatch).toHaveBeenCalledWith(
      openEndpointInEmulator(mockBot.services[0] as any, true)
    );
  });
});
