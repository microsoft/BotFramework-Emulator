import { MenuItemConstructorOptions } from "electron";
import { ContextMenuService } from "./contextMenuService";

jest.mock("electron", () => ({
  Menu: class {
    public static buildFromTemplate(...args: any[]) {
      return {
        popup: () => void 0
      };
    }
  },
  MenuItemConstructorOptions: class {}
}));

describe("The ContextMenuService", () => {
  beforeAll(() => {
    (ContextMenuService as any).currentMenu = { closePopup: () => void 0 };
  });

  it("should show the menu and wait for user input", async () => {
    const options = {} as MenuItemConstructorOptions;
    let resolved = false;
    const closePopupSpy = jest.spyOn(
      (ContextMenuService as any).currentMenu,
      "closePopup"
    );
    ContextMenuService.showMenuAndWaitForInput([options]).then(() => {
      resolved = true;
    });
    expect(closePopupSpy).toHaveBeenCalled();
    expect(options.click).not.toBeNull();
    await options.click({} as any, null, null);
    expect(resolved).toBeTruthy();
  });
});
