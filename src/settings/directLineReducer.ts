import { Reducer } from 'redux';
import { IDirectLineState, directLineDefault } from '../types/settingsTypes';


export type DirectLineAction = {
    type: 'DirectLine_SetPort',
    state: {
        port: number
    }
}

export const directLineReducer: Reducer<IDirectLineState> = (
    state = directLineDefault,
    action: DirectLineAction
) => {
    console.log('directLineReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'DirectLine_SetPort':
            return Object.assign({}, state, { port: action.state.port });
        default:
            return state
    }
}
