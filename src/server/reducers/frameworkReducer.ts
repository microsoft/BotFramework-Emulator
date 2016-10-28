import { Reducer } from 'redux';
import { IFrameworkSettings, frameworkDefault } from '../../types/serverSettingsTypes';


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
    switch (action.type) {
        case 'Framework_SetPort':
            return Object.assign({}, state, { port: action.state.port });
        default:
            return state
    }
}

