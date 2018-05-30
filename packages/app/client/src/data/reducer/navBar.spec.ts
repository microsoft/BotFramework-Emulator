import { NavBarAction, select } from '../action/navBarActions';
import navBar, { NavBarState } from './navBar';

describe('NavBar reducer unit tests', () => {
  const DEFAULT_STATE: NavBarState = {
    selection: null
  };

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: NavBarAction = {
      type: null,
      payload: null
    };
    const startingState = { ...DEFAULT_STATE };
    const endingState = navBar(DEFAULT_STATE, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  it('should change the "selection" state', () => {
    const action: NavBarAction = select('test-selection');
    const state = navBar(DEFAULT_STATE, action);
    expect(state.selection).toBe('test-selection');
  });
});