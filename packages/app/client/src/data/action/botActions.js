export const ADD = 'BOT/ADD';
export const LOAD_BOTS_REQUEST = 'BOT/LOAD_BOTS_REQUEST';
export const LOAD_BOTS_RESPONSE = 'BOT/LOAD_BOTS_RESPONSE';
export const REMOVE = 'BOT/REMOVE';
export const SET_ACTIVE = 'BOT/SET_ACTIVE';

export function add(handle) {
    return {
        type: ADD,
        payload: handle
    };
}

// cause main process to read file system for bots
export function loadBotsRequest(botsFilePath) {
    return {
        type: LOAD_BOTS_REQUEST,
        meta: { send: true },
        payload: botsFilePath
    };
}

export function loadBotsResponse(bots) {
    return {
        type: LOAD_BOTS_RESPONSE,
        payload: bots
    };
}

export function remove(handle) {
    return {
        type: DELETE,
        payload: handle
    };
}

export function setActive(handle) {
    return {
        type: SET_ACTIVE,
        payload: handle
    };
}
