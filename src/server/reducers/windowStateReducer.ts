import { Reducer } from 'redux';
import { IWindowStateSettings, windowStateDefault } from '../../types/serverSettingsTypes';


export type WindowStateAction = {
    type: 'Window_RememberBounds',
    state: {
        top: number,
        left: number,
        width: number,
        height: number
    }
}

export const windowStateReducer: Reducer<IWindowStateSettings> = (
    state = windowStateDefault,
    action: WindowStateAction
) => {
    //console.log('windowStateReducer', JSON.stringify(action), JSON.stringify(state));
    switch (action.type) {
        case 'Window_RememberBounds':
            return Object.assign({}, state, {
                top: action.state.top,
                left: action.state.left,
                width: action.state.width,
                height: action.state.height
            });
        default:
            return state
    }
}
