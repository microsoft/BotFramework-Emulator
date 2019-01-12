import { DialogService } from "./dialogService";
import * as React from "react";
import { Component } from "react";
import { resources } from "../../../data/reducer/resourcesReducer";
import { bot } from "../../../data/reducer/bot";
import { combineReducers, createStore } from "redux";
import * as DialogActions from "../../../data/action/dialogActions";

const mockComponent = class extends Component<{}, {}> {
  public render() {
    return <div />;
  }

  componentDidMount() {
    setTimeout(() => DialogService.hideDialog(1), 50);
  }
};
const mockStore = createStore(combineReducers({ resources, bot }));
jest.mock("../../../data/store", () => ({
  get store() {
    return mockStore;
  }
}));
describe("The DialogService", () => {
  it("should resolve to null if no dialogHost element is set", async () => {
    const result = await DialogService.showDialog(mockComponent);
    expect(result).toBeNull();
  });

  it('should render the component to the host element and notify the store when "showDialog" is called', async () => {
    const hostElement = document.createElement("div");
    const dispatchSpy = jest.spyOn(mockStore, "dispatch");
    let renderedToElementEvent = undefined;
    hostElement.addEventListener("dialogRendered", event => {
      renderedToElementEvent = event;
    });
    DialogService.setHost(hostElement);
    const result = await DialogService.showDialog(mockComponent);
    expect(renderedToElementEvent).not.toBeUndefined();
    expect(result).toBe(1);
    expect(dispatchSpy).toHaveBeenCalledWith(DialogActions.setShowing(true));
  });
});
