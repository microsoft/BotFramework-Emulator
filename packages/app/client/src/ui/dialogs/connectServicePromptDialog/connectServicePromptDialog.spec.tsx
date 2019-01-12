import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { createStore } from "redux";
import { azureAuth } from "../../../data/reducer/azureAuthReducer";
import { ConnectServicePromptDialog } from "./connectServicePromptDialog";
import { ConnectServicePromptDialogContainer } from "./connectServicePromptDialogContainer";
import { DialogService } from "../service";
import { ServiceTypes } from "botframework-config";

jest.mock("../service", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  }
}));

jest.mock("../dialogStyles.scss", () => ({}));

jest.mock("../../dialogs/", () => ({
  AzureLoginPromptDialogContainer: () => undefined,
  AzureLoginSuccessDialogContainer: () => undefined,
  BotCreationDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined
}));

describe("The ConnectServicePromptDialog component should", () => {
  let parent;
  let node;

  beforeEach(() => {
    parent = mount(
      <Provider store={createStore(azureAuth)}>
        <ConnectServicePromptDialogContainer serviceType={ServiceTypes.Luis} />
      </Provider>
    );
    node = parent.find(ConnectServicePromptDialog);
  });

  it("should render deeply", () => {
    expect(parent.find(ConnectServicePromptDialogContainer)).not.toBe(null);
  });

  it("should contain both a cancel and confirm function in the props", () => {
    const prompt = parent.find(ConnectServicePromptDialog);
    expect(typeof (prompt.props() as any).cancel).toBe("function");
    expect(typeof (prompt.props() as any).confirm).toBe("function");
  });

  it("should exit with code 0 when the user cancels the dialog", () => {
    const spy = jest.spyOn(DialogService, "hideDialog");
    const instance = node.instance();
    instance.props.cancel();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it("should exit with code 1 when the confirmation is selected", () => {
    const spy = jest.spyOn(DialogService, "hideDialog");
    const instance = node.instance();
    instance.props.confirm();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it("should exit with code 2 when add luis apps manually is selected", () => {
    const spy = jest.spyOn(DialogService, "hideDialog");
    const instance = node.instance();
    instance.props.addServiceManually();
    expect(spy).toHaveBeenCalledWith(2);
  });
});
