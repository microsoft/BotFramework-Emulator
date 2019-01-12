import { WindowStateSettings } from "@bfemulator/app-shared";
import { Action } from "redux";

export const REMEMBER_THEME = "REMEMBER_THEME";
export const REMEMBER_BOUNDS = "REMEMBER_BOUNDS";
export const REMEMBER_ZOOM_LEVEL = "REMEMBER_ZOOM_LEVEL";

export interface WindowStateAction<P> extends Action {
  type: WindowStateActionType;
  payload?: P;
  state?: P;
}

export declare type WindowStateActionType =
  | "REMEMBER_THEME"
  | "REMEMBER_BOUNDS"
  | "REMEMBER_ZOOM_LEVEL";
export declare type WindowStatePayload =
  | RememberZoomLevelPayload
  | RememberBoundsPayload
  | RememberThemePayload;

export interface RememberThemePayload {
  theme?: string;
}

export interface RememberBoundsPayload {
  displayId?: number;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

export interface RememberZoomLevelPayload {
  zoomLevel?: number;
}

export function rememberTheme(
  theme: string
): WindowStateAction<RememberThemePayload> {
  return {
    type: REMEMBER_THEME,
    payload: {
      theme
    }
  };
}

export function rememberBounds(
  state: WindowStateSettings
): WindowStateAction<RememberBoundsPayload> {
  return {
    type: REMEMBER_BOUNDS,
    state
  };
}

export function rememberZoomLevel(
  state: WindowStateSettings
): WindowStateAction<RememberZoomLevelPayload> {
  return {
    type: REMEMBER_ZOOM_LEVEL,
    state
  };
}
