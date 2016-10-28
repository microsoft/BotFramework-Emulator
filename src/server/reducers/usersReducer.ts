import { Reducer } from 'redux';
import { IUserSettings, usersDefault } from '../../types/serverSettingsTypes'
import { IUser } from '../../types/userTypes';


export type UsersAction = {
    type: 'Users_SetCurrentUser',
    state: {
        user: IUser
    }
}

export const usersReducer: Reducer<IUserSettings> = (
    state = usersDefault,
    action: UsersAction
) => {
    switch (action.type) {
        case 'Users_SetCurrentUser':
            const usersById = Object.assign({}, state.usersById );
            usersById[action.state.user.id] = action.state.user;
            return Object.assign({}, { currentUserId: action.state.user.id, usersById });
        default:
            return state
    }
}
