export const CREATE = 'BOT/CREATE';
export const DELETE = 'BOT/DELETE';
export const LOAD = 'BOT/LOAD';
export const PATCH = 'BOT/PATCH';
export const REMOVE = 'BOT/REMOVE';
export const SET_ACTIVE = 'BOT/SET_ACTIVE';

export function create(bot) {
  return {
    type: CREATE,
    payload: bot
  };
}

export function deleteBot(bot) {
  return {
    type: DELETE,
    payload: bot
  };
}

export function load(bots) {
  return {
    type: LOAD,
    payload: bots
  };
}

export function patch(id, bot) {
  return {
    type: PATCH,
    payload: {
      id,
      bot
    }
  };
}

export function remove(id) {
  return {
    type: DELETE,
    payload: id
  };
}

export function setActive(id) {
  return {
    type: SET_ACTIVE,
    payload: id
  };
}
