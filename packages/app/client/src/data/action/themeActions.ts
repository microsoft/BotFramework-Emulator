export const SWITCH_THEME = "switchTheme";
export declare type ThemeType = "switchTheme";

export interface ThemeAction<T> {
  type: ThemeType;
  payload: T;
}

export interface SwitchThemePayload {
  themeName: string;
  themeComponents: string[];
}

export function switchTheme(
  themeName: string,
  themeComponents: string[]
): ThemeAction<SwitchThemePayload> {
  return {
    type: SWITCH_THEME,
    payload: { themeName, themeComponents }
  };
}
