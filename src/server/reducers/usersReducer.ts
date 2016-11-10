import { Reducer } from 'redux';
import { IUserSettings, usersDefault } from '../../types/serverSettingsTypes'
import { IUser } from '../../types/userTypes';


export type UsersAction = {
    type: 'Users_SetCurrentUser',
    state: {
       user: IUser
    }
} | {
    type: 'Users_AddUsers',
    state: {
        users: IUser[]
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
        case 'Users_AddUsers': {
            let newUsersById = {};
            for(let key in action.state.users) {
                let user = action.state.users[key];
                newUsersById[user.id] = user;
            }
            return Object.assign({}, state, { usersById: newUsersById });
        }
        default:
            return state;
    }
}
