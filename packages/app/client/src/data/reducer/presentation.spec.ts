import { PresentationAction, disable, enable } from '../action/presentationActions';
import presentation, { PresentationState } from './presentation';

describe('Presentation reducer tests', () => {
  const DEFAULT_STATE: PresentationState = {
    enabled: null
  };

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: PresentationAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = presentation(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should disable presentation mode', () => {
    const action: PresentationAction = disable();
    const state = presentation(DEFAULT_STATE, action);
    expect(state.enabled).toBe(false);
  });

  it('should enable presentation mode', () => {
    const action: PresentationAction = enable();
    const state = presentation(DEFAULT_STATE, action);
    expect(state.enabled).toBe(true);
  });
});