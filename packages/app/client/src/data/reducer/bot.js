import * as BotActions from '../action/botActions';

const DEFAULT_STATE = {
    activeBot: null,
    bots: []
};

export default function bot(state = DEFAULT_STATE, action) {
    const payload = action.payload;

    switch(action.type) {
        case BotActions.ADD:
            break;

        case BotActions.LOAD_BOTS_RESPONSE:
            state = setBotsState(payload, state);
            break;

        case BotActions.REMOVE:
            break;

        case BotActions.SET_ACTIVE:
            state = setActiveBot(payload, state);
            break;

        default:
            break;
    }
    return state;
}

function setBotsState(bots, state) {
    let newState = Object.assign({}, state);

    newState.bots = bots;
    return newState;
}

function setActiveBot(botHandle, state) {
    let newState = Object.assign({}, state);

    newState.activeBot = botHandle;
    return newState;
}
