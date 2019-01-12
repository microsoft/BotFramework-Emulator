import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { AzureLoginFailedDialogContainer } from "./azureLoginFailedDialogContainer";
import { combineReducers, createStore } from "redux";
import { azureAuth } from "../../../data/reducer/azureAuthReducer";
import { AzureLoginFailedDialog } from "./azureLoginFailedDialog";

jest.mock("../service", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  }
}));

jest.mock("../dialogStyles.scss", () => ({}));

describe("The AzureLoginFailedDialogContainer component should", () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(
      <Provider store={createStore(combineReducers({ azureAuth }))}>
        <AzureLoginFailedDialogContainer />
      </Provider>
    );
    node = parent.find(AzureLoginFailedDialog);
  });

  it("should render deeply", () => {
    expect(parent.find(AzureLoginFailedDialogContainer)).not.toBe(null);
    expect(parent.find(AzureLoginFailedDialog)).not.toBe(null);
  });

  it("should contain a cancel function in the props", () => {
    expect(typeof (node.props() as any).cancel).toBe("function");
  });

  it("should call the cancel function with the checked state when the onDialogCancel function is called", () => {
    const instance = node.instance();
    const currentCheckedValue = instance.state.rememberMeChecked;
    const { cancel } = instance.props;
    Object.defineProperty(instance, "props", {
      value: {
        cancel
      },
      writable: true,
      configurable: true
    });
    const spy = spyOn(instance.props, "cancel");
    instance.onDialogCancel();
    expect(spy).toHaveBeenCalledWith(currentCheckedValue);
  });
});
