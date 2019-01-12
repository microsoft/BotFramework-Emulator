import { User } from "@bfemulator/sdk-shared";
import { Action } from "redux";

export const SET_CURRENT_USER = "SET_CURRENT_USER";
export const ADD_USERS = "ADD_USERS";
export const REMOVE_USERS = "REMOVE_USERS";

export interface UserAction<P> extends Action {
  type: UserActionType;
  state: P;
}

export interface UserPayload {
  user?: User;
  users?: User[];
}

export declare type UserActionType =
  | "SET_CURRENT_USER"
  | "ADD_USERS"
  | "REMOVE_USERS";

export function addUsers(users: User[]): UserAction<UserPayload> {
  return {
    type: ADD_USERS,
    state: { users }
  };
}

export function removeUsers(users: User[]): UserAction<UserPayload> {
  return {
    type: REMOVE_USERS,
    state: { users }
  };
}

export function setCurrentUser(user: User): UserAction<UserPayload> {
  return {
    type: SET_CURRENT_USER,
    state: { user }
  };
}
