import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { ProgressIndicatorContainer } from "./progressIndicatorContainer";
import { combineReducers, createStore } from "redux";
import { progressIndicator } from "../../../data/reducer/progressIndicator";
import { ProgressIndicator } from "./progressIndicator";

jest.mock("./progressIndicator.scss", () => ({}));
jest.mock("../service", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  }
}));

jest.mock("../dialogStyles.scss", () => ({}));

describe("The ProgressIndicatorContainer component should", () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(
      <Provider store={createStore(combineReducers({ progressIndicator }))}>
        <ProgressIndicatorContainer label="test" progress={50} />
      </Provider>
    );
    node = parent.find(ProgressIndicator);
  });

  it("should render deeply", () => {
    expect(parent.find(ProgressIndicatorContainer)).not.toBe(null);
    expect(parent.find(ProgressIndicator)).not.toBe(null);
  });

  it("should contain a cancel function in the props", () => {
    expect(typeof (node.props() as any).cancel).toBe("function");
    expect(typeof (node.props() as any).close).toBe("function");
  });
});
