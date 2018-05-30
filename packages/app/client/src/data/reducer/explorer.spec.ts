import { ExplorerState } from './explorer';
import explorer from './explorer';
import { ExplorerAction, ExplorerActions } from '../action/explorerActions';

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
    const action: ExplorerAction = {
      type: ExplorerActions.show,
      payload: {
        show: true
      }
    };

    const endingState = explorer(DEFAULT_STATE, action);
    expect(endingState.showing).toBe(true);
  });
});