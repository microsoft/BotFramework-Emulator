export const ADD = 'BOT/ADD';
export const LOAD_BOTS = 'BOT/LOAD_BOTS';
export const LOAD_BOTS_INIT = 'BOT/LOAD_BOTS_INIT';
export const REMOVE = 'BOT/REMOVE';
export const SET_ACTIVE = 'BOT/SET_ACTIVE';

export function add(handle) {
    return {
        type: ADD,
        payload: handle
    };
}

export function loadBots(bots) {
    return {
        type: LOAD_BOTS,
        payload: bots
    };
}

// cause main process to read file system for bots
export function loadBotsInit(botsFilePath) {
    return {
        type: LOAD_BOTS_INIT,
        meta: { send: true },
        payload: botsFilePath
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
