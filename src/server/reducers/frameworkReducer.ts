import { Reducer } from 'redux';
import { IFrameworkSettings, frameworkDefault } from '../../types/serverSettingsTypes';


export type FrameworkAction = {
    type: 'Framework_Set1',
    state: {
        port: string,
        ngrokPath: string,
        serviceUrl: string
    }
} | {
    type: 'Framework_Set2',
    state: {
        port: string,
        ngrokPath: string,
        serviceUrl: string,
        ngrokServiceUrl: string
    }
}

export const frameworkReducer: Reducer<IFrameworkSettings> = (
    state = frameworkDefault,
    action: FrameworkAction
) => {
    switch (action.type) {
        case 'Framework_Set1':
        case 'Framework_Set2':
            return Object.assign({}, state, action.state);
        default:
            return state
    }
}
