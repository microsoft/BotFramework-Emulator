import { editor } from "../../../data/reducer/editor";
import { combineReducers, createStore } from "redux";
import { mount } from "enzyme";
import * as React from "react";
import { TabManager } from "./tabManager";
import { TabManagerContainer } from "./tabManagerContainer";
import { Provider } from "react-redux";

const mockState = {
  editor: {
    activeEditor: "primary",
    draggingTab: true,
    editors: {
      primary: {
        activeDocumentId: "1234",
        documents: {
          "e7985c20-b059-11e8-8bf1-69211e6350d9": {
            contentType:
              "application/vnd.microsoft.bfemulator.document.livechat",
            documentId: "e7985c20-b059-11e8-8bf1-69211e6350d9",
            isGlobal: false
          },
          "12345678": {
            contentType:
              "application/vnd.microsoft.bfemulator.document.transcript",
            documentId: "12345678",
            isGlobal: false,
            fileName: "CardExamples.transcript"
          },
          "1234": {
            contentType:
              "application/vnd.microsoft.bfemulator.document.transcript",
            documentId: "1234",
            isGlobal: false
          }
        },
        recentTabs: [
          "1234",
          "12345678",
          "e7985c20-b059-11e8-8bf1-69211e6350d9"
        ],
        tabOrder: ["e7985c20-b059-11e8-8bf1-69211e6350d9", "12345678", "1234"]
      },
      secondary: {
        activeDocumentId: null,
        documents: {},
        recentTabs: [],
        tabOrder: []
      }
    },
    docsWithPendingChanges: []
  }
};
const mockStore = createStore(combineReducers({ editor }), mockState);
const windowEvents = [];
const mockWindow = {
  addEventListener: event => {
    windowEvents.push(event);
  }
};
jest.mock("../../../data/store", () => ({
  get store() {
    return mockStore;
  }
}));
jest.mock("./tabManager.scss", () => ({}));

describe("The TabManager component", () => {
  let parent;
  let node;
  let instance;
  beforeEach(() => {
    windowEvents.length = 0;
    parent = mount(
      <Provider store={mockStore}>
        <TabManagerContainer window={mockWindow} />
      </Provider>
    );
    node = parent.find(TabManager);
    instance = node.instance();
  });

  it("should set event listeners on the window object when the component mounts", () => {
    expect(windowEvents).toEqual(["keydown", "keyup"]);
  });

  describe("should set the state as expected when the", () => {
    it('"ArrowUp" key is pressed with the selected index at 0', () => {
      instance.setState({ showing: true, selectedIndex: 0 });
      instance.onKeyDown({ key: "ArrowUp" });
      expect(instance.state.selectedIndex).toBe(2);
    });

    it('"ArrowUp" key is pressed with the selected index not zero', () => {
      instance.setState({ showing: true, selectedIndex: 1 });
      instance.onKeyDown({ key: "ArrowUp" });
      expect(instance.state.selectedIndex).toBe(0);
    });

    it('"DownArrow" key is pressed with the selectedIndex not zero', () => {
      instance.setState({ showing: true, selectedIndex: 2 });
      instance.onKeyDown({ key: "DownArrow" });
      expect(instance.state.selectedIndex).toBe(2);
    });

    it('"DownArrow" key is pressed with the selectedIndex at 0', () => {
      instance.setState({ showing: true, selectedIndex: 0 });
      instance.onKeyDown({ key: "DownArrow" });
      expect(instance.state.selectedIndex).toBe(0);
    });

    it('"Control" key is pressed', () => {
      instance.setState({ showing: true, controlIsPressed: false });
      instance.onKeyDown({ key: "Control" });
      expect(instance.state.controlIsPressed).toBeTruthy();
    });
  });
});
