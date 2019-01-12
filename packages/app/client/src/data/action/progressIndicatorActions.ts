import { Action } from "redux";

export const UPDATE_PROGRESS_INDICATOR = "UPDATE_PROGRESS_INDICATOR";
export const CANCEL_CURRENT_PROCESS = "CANCEL_CURRENT_PROCESS";

export interface ProgressIndicatorAction<T> extends Action {
  payload: T;
}

export interface ProgressIndicatorPayload {
  label: string;
  progress: number;
}

export function updateProgressIndicator({
  label,
  progress
}: ProgressIndicatorPayload): ProgressIndicatorAction<
  ProgressIndicatorPayload
> {
  return {
    type: UPDATE_PROGRESS_INDICATOR,
    payload: { label, progress }
  };
}

export function cancelCurrentProcess(): ProgressIndicatorAction<void> {
  return {
    type: CANCEL_CURRENT_PROCESS,
    payload: void 0
  };
}
