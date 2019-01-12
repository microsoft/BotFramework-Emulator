import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { AzureLoginSuccessDialogContainer } from "./azureLoginSuccessDialogContainer";
import { combineReducers, createStore } from "redux";
import { azureAuth } from "../../../data/reducer/azureAuthReducer";
import { AzureLoginSuccessDialog } from "./azureLoginSuccessDialog";

jest.mock("../service", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  }
}));

jest.mock("../dialogStyles.scss", () => ({}));

describe("The AzureLoginSuccessDialogContainer component should", () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(
      <Provider store={createStore(combineReducers({ azureAuth }))}>
        <AzureLoginSuccessDialogContainer />
      </Provider>
    );
    node = parent.find(AzureLoginSuccessDialog);
  });

  it("should render deeply", () => {
    expect(parent.find(AzureLoginSuccessDialogContainer)).not.toBe(null);
    expect(parent.find(AzureLoginSuccessDialog)).not.toBe(null);
  });

  it("should contain a cancel function in the props", () => {
    expect(typeof (node.props() as any).cancel).toBe("function");
  });

  it("should update the state when the checkbox is clicked", () => {
    const instance = node.instance();
    expect("rememberMeChecked" in instance.state);
    const currentCheckedValue = instance.state.rememberMeChecked;
    instance.checkBoxChanged({ target: { checked: true } } as any);
    expect(instance.state.rememberMeChecked).toBe(!currentCheckedValue);
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
