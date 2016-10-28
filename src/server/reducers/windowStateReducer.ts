import { Reducer } from 'redux';
import { IWindowStateSettings, windowStateDefault } from '../../types/serverSettingsTypes';


export type WindowStateAction = {
    type: 'Window_RememberBounds',
    state: {
        width: number,
        height: number,
        left: number,
        top: number
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
                width: action.state.width,
                height: action.state.height,
                left: action.state.left,
                top: action.state.top
            });
        default:
            return state
    }
}
