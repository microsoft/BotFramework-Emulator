const DEFAULT_STATE = {
    documents: [{
        contentType: 'application/vnd.microsoft.botframework.bot',
        directLineURL: 'http://example.com/',
        title: 'TestBotV3'
    }, {
        contentType: 'application/vnd.microsoft.card.adaptive',
        title: 'Welcome.card.json'
    }]
};

export default function documents(state = DEFAULT_STATE, action) {
    switch (action.type) {
    default: break;
    }

    return state;
}
