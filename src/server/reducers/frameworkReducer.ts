import { Reducer } from 'redux';
import { IFrameworkSettings, frameworkDefault } from '../../types/serverSettingsTypes';


export type FrameworkAction = {
    type: 'Framework_SetPort',
    state: {
        port: number
    }
} | {
    type: 'Framework_SetNgrokPath',
    state: {
        path: string
    }
}

export const frameworkReducer: Reducer<IFrameworkSettings> = (
    state = frameworkDefault,
    action: FrameworkAction
) => {
    switch (action.type) {
        case 'Framework_SetPort':
            return Object.assign({}, state, { port: action.state.port });
        case 'Framework_SetNgrokPath':
            return Object.assign({}, state, { ngrokPath: action.state.path });
        default:
            return state
    }
}

