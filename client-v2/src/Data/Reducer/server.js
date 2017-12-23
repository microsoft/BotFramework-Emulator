import { fromJS } from 'immutable';
import * as ServerActions from '../Action/ServerActions';

const DEFAULT_STATE = fromJS({
    connected: false
});

export default function server(state = DEFAULT_STATE, action) {
    const { payload } = action;

    switch (action.type) {
    case ServerActions.ALIVE:
        state = state.set('connected', true).set('host', payload.host).set('version', payload.version);
        break;

    case ServerActions.PING:
        state = state.set('connected', null);
        break;

    default: break;
    }

    return state;
}
