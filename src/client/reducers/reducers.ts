import { Reducer } from 'redux';
import { ISettings, settingsDefault } from '../settings';


export type SettingsAction = {
    type: 'Remember_HorizSplit',
    state: {
        size: number
    }
} | {
    type: 'Remember_VertSplit',
    state: {
        size: number
    }
}

export const settingsReducer: Reducer<ISettings> = (
    state = settingsDefault,
    action: SettingsAction
) => {
    switch (action.type) {
        case 'Remember_HorizSplit':
            return Object.assign({}, state, { horizSplit: action.state.size });
        case 'Remember_VertSplit':
            return Object.assign({}, state, { vertSplit: action.state.size });
        default:
            return state;
    }
}
