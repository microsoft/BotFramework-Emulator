import * as React from "react";
import { shallow } from "enzyme";
import { Main } from "./main";
function mockProxy() {
  return new Proxy(
    {},
    {
      get() {
        return () => ({});
      }
    }
  );
}
jest.mock("./main.scss", () => ({}));
jest.mock("./explorer", () => mockProxy());
jest.mock("./mdi", () => mockProxy());
jest.mock("./navBar", () => mockProxy());
jest.mock("./statusBar/statusBar.scss", () => ({}));
jest.mock("../debug/storeVisualizer.scss", () => ({}));
jest.mock("../../ui/dialogs", () => ({
  AzureLoginPromptDialogContainer: function mock() {
    return undefined;
  },
  AzureLoginSuccessDialogContainer: function mock() {
    return undefined;
  },
  BotCreationDialog: function mock() {
    return undefined;
  },
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: function mock() {
    return undefined;
  }
}));
describe("The Main component", () => {
  it("should pass an empty test", () => {
    const parent = shallow(<Main />);
    expect(parent.find(Main)).not.toBe(null);
  });
});
