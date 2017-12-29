export const CARD_UPDATE_JSON = "CARD_UPDATE_JSON";
export const CARD_ADD_OUTPUT_MSG = "CARD_ADD_OUTPUT_MSG";

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
