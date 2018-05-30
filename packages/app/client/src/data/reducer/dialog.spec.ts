import { DialogAction, setShowing } from '../action/dialogActions';
import dialog, { DialogState } from './dialog';

describe('Dialog reducer tests', () => {
  const DEFAULT_STATE: DialogState = {
    showing: false
  };

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: DialogAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = dialog(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should toggle the "showing" state', () => {
    const action: DialogAction = setShowing(true);

    const endingState = dialog(DEFAULT_STATE, action);
    expect(endingState.showing).toBe(true);
  });
});