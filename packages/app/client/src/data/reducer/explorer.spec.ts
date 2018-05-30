import { ExplorerAction, show } from '../action/explorerActions';
import explorer, { ExplorerState } from './explorer';

describe('Explorer reducer tests', () => {
  const DEFAULT_STATE: ExplorerState = {
    showing: false
  };

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: ExplorerAction = { type: null, payload: null };
    const startingState = { ...DEFAULT_STATE };
    const endingState = explorer(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should toggle the "showing state"', () => {
    const action: ExplorerAction = show(true);

    const state = explorer(DEFAULT_STATE, action);
    expect(state.showing).toBe(true);
  });
});