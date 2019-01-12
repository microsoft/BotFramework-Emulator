import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { combineReducers, createStore } from "redux";
import { bot } from "../../../../../data/reducer/bot";
import { DialogService } from "../../../../dialogs/service";
import { EndpointEditor } from "./endpointEditor";
import { EndpointEditorContainer } from "./endpointEditorContainer";
import { load, setActive } from "../../../../../data/action/botActions";

const mockStore = createStore(combineReducers({ bot }), {});

jest.mock("./endpointEditor.scss", () => ({}));
jest.mock("../../../../../data/store", () => ({
  get store() {
    return mockStore;
  }
}));

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
      appId: "51fc2648-1190-44aa-9559-87b11b1d0014",
      id: "112233",
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

  beforeEach(() => {
    mockStore.dispatch(load([mockBot as any]));
    mockStore.dispatch(setActive(mockBot as any));

    parent = mount(
      <Provider store={mockStore}>
        <EndpointEditorContainer endpointService={mockBot.services[0]} />
      </Provider>
    );
    node = parent.find(EndpointEditor);
  });

  it("should render deeply", () => {
    expect(parent.find(EndpointEditorContainer)).not.toBe(null);
    expect(parent.find(EndpointEditor)).not.toBe(null);
  });

  it("should have the expected functions available in the props", () => {
    const props = node.props();
    expect(typeof props.updateEndpointService).toBe("function");
    expect(typeof props.cancel).toBe("function");
  });

  it("should look for the matching ABS service based on the endpointService.id", () => {
    const instance = node.instance();
    expect(instance.props.botService).toEqual(mockBot.services[1]);
  });

  it("should update the state when the user types in the input fields", () => {
    const instance = node.instance();
    const mockEvent = {
      target: {
        hasAttribute: () => true,
        value: "a name",
        dataset: { prop: "name" }
      }
    };
    instance.onEndpointInputChange(mockEvent as any);
    expect(instance.state.endpointService.name).toBe("a name");
  });

  it("should update channelService when toggle us gov checkbox", () => {
    const instance = node.instance();

    // initially undefined
    expect((instance.state.endpointService as any).channelService).toBe(
      undefined
    );

    // checked
    const mockCheck = { target: { checked: true } };
    instance.onChannelServiceChange(mockCheck as any);

    expect((instance.state.endpointService as any).channelService).toBe(
      "https://botframework.azure.us"
    );

    // unchecked
    mockCheck.target.checked = false;
    instance.onChannelServiceChange(mockCheck as any);

    expect((instance.state.endpointService as any).channelService).toBe("");
  });

  it("should set an error when a required field is null", () => {
    const instance = node.instance();
    const mockEvent = {
      target: { hasAttribute: () => true, value: "", dataset: { prop: "name" } }
    };
    instance.onEndpointInputChange(mockEvent as any);
    expect(instance.state.nameError).not.toBeUndefined();
  });

  it("should validate the endpoint when an endpoint is entered and display a message after 500ms", done => {
    const endpointValidationSpy = jest
      .spyOn(EndpointEditor as any, "validateEndpoint")
      .mockReturnValue(false);
    const instance = node.instance();
    const mockEvent = {
      target: {
        hasAttribute: () => true,
        value: "http://localhost",
        dataset: { prop: "endpoint" }
      }
    };
    instance.onEndpointInputChange(mockEvent as any);
    setTimeout(() => {
      expect(instance.state.endpointWarning).toBeFalsy();
    }, 490);

    setTimeout(() => {
      expect(endpointValidationSpy).toHaveBeenCalledWith("http://localhost");
      done();
    }, 510);
  });

  it("should update the botService when the AVS inputs change", () => {
    const instance = node.instance();
    const mockEvent = {
      target: {
        hasAttribute: () => false,
        value: "someId",
        dataset: { prop: "tenantId" }
      }
    };
    instance.onBotInputChange(mockEvent as any);
    expect(instance.state.botService.tenantId).toBe("someId");
  });

  it("should expand the ABS content when the abs link is clicked", () => {
    const instance = node.instance();
    expect(instance.absContent.style.height).toBe("0px");
    Object.defineProperty(
      instance.absContent.firstElementChild,
      "clientHeight",
      { get: () => 135 }
    );
    instance.onABSLinkClick({ currentTarget: document.createElement("a") });
    expect(instance.absContent.style.height).toEqual("135px");
  });

  it("should update the endpoint service when onSubmitClick is called", () => {
    const instance = node.instance();
    instance.state.botService = {
      tenantId: "1234",
      subscriptionId: "5678",
      resourceGroup: "abs123",
      serviceName: "321"
    };
    const hideDialogSpy = jest.spyOn(DialogService, "hideDialog");
    instance.onSubmitClick();

    expect(hideDialogSpy).toHaveBeenCalledWith([
      {
        appId: "51fc2648-1190-44aa-9559-87b11b1d0014",
        appPassword: "vcxzvcxzvvxczvcxzv",
        endpoint: "https://testbot.botframework.com/api/messagesv3",
        id: "https://testbot.botframework.com/api/messagesv3",
        name: "https://testbot.botframework.com/api/messagesv3",
        type: "endpoint"
      },
      {
        appId: "51fc2648-1190-44aa-9559-87b11b1d0014",
        resourceGroup: "abs123",
        serviceName: "321",
        subscriptionId: "5678",
        tenantId: "1234"
      }
    ]);
  });

  it("should cancel the dialog when onCancelClick is called", () => {
    const instance = node.instance();
    const hideDialogSpy = jest.spyOn(DialogService, "hideDialog");

    instance.onCancelClick();
    expect(hideDialogSpy).toHaveBeenCalled();
  });
});
