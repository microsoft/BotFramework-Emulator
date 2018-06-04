import { State } from '../state';
import { Store } from 'redux';
import { getStore } from '../store';

describe('The serviceUrl reducer', () => {
  let store: Store<State> = getStore();

  test('should updated the store when a new serviceUrl action is dispatched', () => {
    store.dispatch({ type: 'updateServiceUrl', payload: 'http://localhost' });
    expect(store.getState().serviceUrl).toEqual('http://localhost');
  });

});
