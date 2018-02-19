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

export function patch(botId, bot) {
  return {
    type: PATCH,
    payload: {
      botId,
      bot
    }
  };
}

export function remove(botId) {
  return {
    type: DELETE,
    payload: botId
  };
}

export function setActive(botId) {
  return {
    type: SET_ACTIVE,
    payload: botId
  };
}
