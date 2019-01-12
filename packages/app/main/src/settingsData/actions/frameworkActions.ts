import { FrameworkSettings } from "@bfemulator/app-shared";
import { Action } from "redux";

export const SET_FRAMEWORK = "SET_FRAMEWORK";
export declare type SetFrameworkType = "SET_FRAMEWORK";

export interface FrameworkAction<P> extends Action {
  type: SetFrameworkType;
  state: P;
}

export function setFramework(
  frameworkSettings: FrameworkSettings
): FrameworkAction<FrameworkSettings> {
  return {
    type: SET_FRAMEWORK,
    state: frameworkSettings
  };
}
