import { Reducer } from 'redux';
import { IDirectLineSettings, directLineDefault } from '../settings'


export type DirectLineAction = {
    type: 'DirectLine_SetPort',
    state: {
        port: number
    }
}

export const directLineReducer: Reducer<IDirectLineSettings> = (
    state = directLineDefault,
    action: DirectLineAction
) => {
    switch (action.type) {
        case 'DirectLine_SetPort':
            return Object.assign({}, state, { port: action.state.port });
        default:
            return state
    }
}
