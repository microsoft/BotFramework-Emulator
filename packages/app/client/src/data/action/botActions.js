export const CREATE = 'BOT/CREATE';
export const OPEN = 'BOT/OPEN';
export const PATCH = 'BOT/PATCH';
export const REMOVE = 'BOT/REMOVE';
export const SET_ACTIVE = 'BOT/SET_ACTIVE';

export function create(bot) {
  return {
    type: CREATE,
    payload: bot
  };
}

export function open(bot) {
  return {
    type: OPEN,
    payload: bot
  };
}

export function patch(handle, bot) {
  return {
    type: PATCH,
    payload: {
      handle,
      bot
    }
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
