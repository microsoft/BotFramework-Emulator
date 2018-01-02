export const CARD_UPDATE_JSON = "CARD_UPDATE_JSON";
export const CARD_ADD_OUTPUT_MSG = "CARD_ADD_OUTPUT_MSG";
export const CARD_CLEAR_OUTPUT_WINDOW = "CARD_CLEAR_OUTPUT_WINDOW";

export function updateCardJson(json) {
    return {
        type: CARD_UPDATE_JSON,
        state: { json: json }
    };
}

export function addCardOutputMessage(msg) {
    return {
        type: CARD_ADD_OUTPUT_MSG,
        state: { msg: msg }
    };
}

export function clearCardOutputWindow() {
    return {
        type: CARD_CLEAR_OUTPUT_WINDOW
    };
}
