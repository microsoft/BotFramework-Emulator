import { Menu, MenuItem, MenuItemConstructorOptions } from 'electron';

export class ContextMenuService {
  private static currentMenu: Menu;

  public static showMenuAndWaitForInput(options: Partial<MenuItemConstructorOptions>[]): Promise<any> {
    if (ContextMenuService.currentMenu) {
      ContextMenuService.currentMenu.closePopup();
    }
    return new Promise(resolve => {

      const clickHandler = menuItem => {
        ContextMenuService.currentMenu = null;
        resolve(menuItem);
      };

      const template = options.map(option => {
        option.click = clickHandler;
        return option;
      });
      const menu = ContextMenuService.currentMenu = Menu.buildFromTemplate(template);

      menu.popup();
    });
  }
}
