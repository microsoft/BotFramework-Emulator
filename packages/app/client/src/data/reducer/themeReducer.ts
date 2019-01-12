import { SwitchThemePayload, ThemeAction } from "../action/themeActions";

export interface ThemeState {
  themeName: string;
  themeHref: string;
  themeComponents: string[];
}

export const initialState: ThemeState = {
  themeName: null,
  themeHref: null,
  themeComponents: []
};

export function theme(
  state: ThemeState = initialState,
  action: ThemeAction<SwitchThemePayload>
): ThemeState {
  switch (action.type) {
    case "switchTheme":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
