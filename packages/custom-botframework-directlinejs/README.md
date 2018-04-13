# BotFramework-DirectLineJS

Client library for the [Microsoft Bot Framework](http://www.botframework.com) *[Direct Line](https://docs.botframework.com/en-us/restapi/directline3/)* protocol.

Used by [WebChat](https://github.com/Microsoft/BotFramework-WebChat) and thus (by extension) [Emulator](https://github.com/Microsoft/BotFramework-Emulator), WebChat channel, and [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/).

## FAQ

### *Who is this for?*

Anyone who is building a Bot Framework JavaScript client who does not want to use [WebChat](https://github.com/Microsoft/BotFramework-WebChat).

If you're currently using WebChat, you don't need to make any changes as it includes this package. 

### *What is that funny `subscribe()` method in the samples below?*

Instead of callbacks or Promises, this library handles async operations using Observables. Try it, you'll like it! For more information, check out [RxJS](https://github.com/reactivex/rxjs/).

### *Can I use [TypeScript](http://www.typescriptlang.com)?*

You bet.

### How ready for prime time is this library?

This is an official Microsoft-supported library, and is considered largely complete. Future changes (aside from supporting future updates to the Direct Line protocol) will likely be limited to bug fixes, performance improvements, tutorials, and samples. The big missing piece here is unit tests.

That said, the public API is still subject to change.

## How to build from source

0. Clone this repo
1. `npm install`
2. `npm run build` (or `npm run watch` to rebuild on every change, or `npm run prepublish` to build production)

## How to include in your app

There are several ways:

1. Build from scratch and include either `/directLine.js` (webpacked with rxjs) or `built/directline.js` in your app
2. Use the unpkg CDN, e.g. `<script src="http://unpkg.com/botframework-directlinejs/directLine.js"/>`
3. `npm install botframework-directlinejs`

## Using from within a Node environment

This library uses RxJs/AjaxObserverable which is meant for use in a DOM environment. That doesn't mean you can't also use it from Node though, you just need to do a couple of extra things:

1. `npm install --save xhr2`
2. Add the following towards the top of your main application file:

```typescript
global.XMLHttpRequest = require("xhr2");
```
    
## How to create and use a directLine object

### Obtain security credentials for your bot:

1. If you haven't already, [register your bot](https://dev.botframework.com/bots/new).
2. Add a DirectLine (**not WebChat**) channel, and generate a Direct Line Secret. Make sure Direct Line 3.0 is enabled.
3. For testing you can use your Direct Line Secret as a security token, but for production you will likely want to exchange that Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3/).

### Create a DirectLine object:

```typescript
import { DirectLine } from 'botframework-directlinejs';

var directLine = new DirectLine({
    secret: /* put your Direct Line secret here */,
    token: /* or put your Direct Line token here (supply secret OR token, not both) */,
    domain: /* optional: if you are not using the default Direct Line endpoint, e.g. if you are using a region-specific endpoint, put its full URL here */
    webSocket: /* optional: false if you want to use polling GET to receive messages. Defaults to true (use WebSocket). */,
    pollingInterval: /* optional: set polling interval in milliseconds. Default to 1000 */,
});
```

### Post activities to the bot:

```typescript
directLine.postActivity({
    from: { id: 'myUserId', name: 'myUserName' }, // required (from.name is optional)
    type: 'message',
    text: 'a message for you, Rudy'
}).subscribe(
    id => console.log("Posted activity, assigned ID ", id),
    error => console.log("Error posting activity", error)
);
```

You can also post messages with attachments, and non-message activities such as events, by supplying the appropriate fields in the activity.

### Listen to activities sent from the bot:

```typescript
directLine.activity$
.subscribe(
    activity => console.log("received activity ", activity)
);
```

You can use RxJS operators on incoming activities. To see only message activities:

```typescript
directLine.activity$
.filter(activity => activity.type === 'message')
.subscribe(
    message => console.log("received message ", message)
);
```

Direct Line will helpfully send your client a copy of every sent activity, so a common pattern is to filter incoming messages on `from`:

```typescript
directLine.activity$
.filter(activity => activity.type === 'message' && activity.from.id === 'yourBotHandle')
.subscribe(
    message => console.log("received message ", message)
);
```

### Monitor connection status

Subscribing to either `postActivity` or `activity$` will start the process of connecting to the bot. Your app can listen to the connection status and react appropriately :

```typescript

import { ConnectionStatus } from 'botframework-directlinejs';

directLine.connectionStatus$
.subscribe(connectionStatus => {
    switch(connectionStatus) {
        case ConnectionStatus.Uninitialized:    // the status when the DirectLine object is first created/constructed
        case ConnectionStatus.Connecting:       // currently trying to connect to the conversation
        case ConnectionStatus.Online:           // successfully connected to the converstaion. Connection is healthy so far as we know.
        case ConnectionStatus.ExpiredToken:     // last operation errored out with an expired token. Your app should supply a new one.
        case ConnectionStatus.FailedToConnect:  // the initial attempt to connect to the conversation failed. No recovery possible.
        case ConnectionStatus.Ended:            // the bot ended the conversation
    }
});
```

### Reconnect to a conversation

If your app created your DirectLine object by passing a token, DirectLine will refresh that token every 15 minutes.
Should your client lose connectivity (e.g. close laptop, fail to pay Internet access bill, go under a tunnel), `connectionStatus$`
will change to `ConnectionStatus.ExpiredToken`. Your app can request a new token from its server, which should call
the [Reconnect](https://docs.botframework.com/en-us/restapi/directline3/#reconnecting-to-a-conversation) API. 
The resultant Conversation object can then be passed by the app to DirectLine, which will 

```typescript
var conversation = /* a Conversation object obtained from your app's server */;
directLine.reconnect(conversation);
```

### Resume an existing conversation

When using DirectLine with WebChat, closing the current tab or refreshing the page will create a new conversation in most cases. You can resume an existing conversation to keep the user in the same context.

**When using a secret** you can resume a conversation by:
- Storing the conversationid (in a *permanent* place, like local storage)
- Giving this value back while creating the DirectLine object along with the secret

```typescript
import { DirectLine } from 'botframework-directlinejs';

const dl = new DirectLine({
    secret: /* SECRET */,
    conversationId: /* the conversationid you stored from previous conversation */
});
```

**When using a token** you can resume a conversation by:
- Storing the conversationid and your token (in a *permanent* place, like local storage)
- Calling the DirectLine reconnect API yourself to get a refreshed token and a streamurl
- Creating the DirectLine object using the ConversationId, Token, and StreamUrl

```typescript
import { DirectLine } from 'botframework-directlinejs';

const dl = new DirectLine({
    token: /* the token you retrieved while reconnecting */,
    streamUrl: /* the streamUrl you retrieved while reconnecting */,
    conversationId: /* the conversationid you stored from previous conversation */
});
```

**Getting any history that Direct Line has cached** : you can retrieve history using watermarks:
You can see the watermark as an *activity 'bookmark'*. The resuming scenario will replay all the conversation activities from the watermark you specify. For now, this only works when using the polling version of DirectLine.

```typescript
import { DirectLine } from 'botframework-directlinejs';

const dl = new DirectLine({
    token: /* the token you retrieved while reconnecting */,
    streamUrl: /* the streamUrl you retrieved while reconnecting */,
    conversationId: /* the conversationid you stored from previous conversation */,
    watermark: /* a watermark you saved from a previous conversation */,
    webSocket: false
});
```

*Watermark with websocket will be supported in the future.*

## Copyright & License

© 2017 Microsoft Corporation

[MIT License](/LICENSE)
