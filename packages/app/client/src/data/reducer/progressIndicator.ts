import {
  CANCEL_CURRENT_PROCESS,
  ProgressIndicatorAction,
  ProgressIndicatorPayload,
  UPDATE_PROGRESS_INDICATOR
} from "../action/progressIndicatorActions";

export interface ProgressIndicatorState {
  progress: number;
  label: string;
  canceled: boolean;
}

export const initialState: ProgressIndicatorState = {
  progress: 0,
  label: "",
  canceled: false
};

export function progressIndicator(
  state: ProgressIndicatorState = initialState,
  action: ProgressIndicatorAction<ProgressIndicatorPayload>
): ProgressIndicatorState {
  switch (action.type) {
    case UPDATE_PROGRESS_INDICATOR:
      const { label, progress } = action.payload;
      return { ...state, label, progress };

    case CANCEL_CURRENT_PROCESS:
      return { ...state, canceled: true };

    default:
      return state;
  }
}
