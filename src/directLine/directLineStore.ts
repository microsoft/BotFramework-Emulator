import { Reducer } from 'redux';

export interface IDirectLineState {
    port: number;
}
export const directLineDefault: IDirectLineState = {
    port: 9001
}
export type DirectLineAction = {
    type: 'DirectLine_SetPort',
    port: number
} | {
    type: 'DirectLine_SetState',
    state: IDirectLineState
}
export const directLineReducer: Reducer<IDirectLineState> = (
    state = directLineDefault,
    action: DirectLineAction
) => {
    console.log('directLineReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'DirectLine_SetPort':
            return Object.assign({}, state, { port: action.port });
        case 'DirectLine_SetState':
            return Object.assign({}, state, action.state);
        default:
            return state
    }
}
