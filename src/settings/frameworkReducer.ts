import { Reducer } from 'redux';

export interface IFrameworkState {
    port: number;
}
export const frameworkDefault: IFrameworkState = {
    port: 9002
}
export type FrameworkAction = {
    type: 'Framework_SetPort',
    state: {
        port: number
    }
} | {
    type: 'Framework_SetState',
    state: IFrameworkState
}
export const frameworkReducer: Reducer<IFrameworkState> = (
    state = frameworkDefault,
    action: FrameworkAction
) => {
    console.log('frameworkReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'Framework_SetPort':
            return Object.assign({}, state, { port: action.state.port });
        case 'Framework_SetState':
            return Object.assign({}, state, action.state);
        default:
            return state
    }
}

