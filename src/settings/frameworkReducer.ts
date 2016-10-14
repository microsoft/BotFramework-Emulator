import { Reducer } from 'redux';
import { IFrameworkSettings, frameworkDefault } from '../types/settingsTypes';


export type FrameworkAction = {
    type: 'Framework_SetPort',
    state: {
        port: number
    }
}

export const frameworkReducer: Reducer<IFrameworkSettings> = (
    state = frameworkDefault,
    action: FrameworkAction
) => {
    console.log('frameworkReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'Framework_SetPort':
            return Object.assign({}, state, { port: action.state.port });
        default:
            return state
    }
}

