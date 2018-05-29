import { DialogState } from './dialog';
import dialog from './dialog';
import { DialogAction, DialogActions } from '../action/dialogActions';

describe('Dialog reducer tests', () => {
  const DEFAULT_STATE: DialogState = {
    showing: false
  };

  it('should return state for non-matching action type', () => {
    const emptyAction: DialogAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    let endingState = dialog(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should toggle the "showing" state', () => {
    const action: DialogAction = {
      type: DialogActions.setShowing,
      payload: {
        showing: true
      }
    };

    let endingState = dialog(DEFAULT_STATE, action);
    expect(endingState.showing).toBe(true);
  });
});