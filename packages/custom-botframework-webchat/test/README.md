# Automated Testing framework for Web Chat via Direct Line API

> ## Disclaimer: This test framework is intended for Web Chat and DirectLine testing ONLY. This is NOT intended for testing Bots.

### Prerequisites

We'll be using both [Nightmare.js](http://www.nightmarejs.org/) with [Mocha.js](https://mochajs.org/) to run our testing.
If you forked the [Web Chat repo](https://github.com/Microsoft/BotFramework-WebChat), these dependencies are already included in the
[package.json](https://github.com/Microsoft/BotFramework-WebChat/blob/master/package.json) file.

## Overview of the test framework ecosystem

The test framework includes two major components:

* A Web Chat channel client application.
* A mock service and client objects which communicates through the Web Chat channel via __DirectLine API__. This service submits dummy data to the Web Chat instance while the tests run.

<pre>
[ Web Chat (test.html) ]                             [ Mock Service ]
┌───────────────┐         ┌─────────────┐            ┌─────────────────────┐
│  Electron App │   <---  │ Direct Line │   <---     │ mock_dl\index.ts    │
├───────────────┤   --->  │     API     │   --->     ├─────────────────────┤
│               │         └─────────────┘            │ commands_map.ts     │
│     Bot       │                                    │┌───────────────────┐│
│  interactive  │               Direct Line.ts --->  ││ .server           ││
│     area      │                                    ││ server_content.ts ││
│               │         ┌─────────────┐            │├───────────────────┤│
├───────────────┤         │ Mocha tests │    <---    ││ .client           ││
│ Chat inputbox │  <--->  │ uitest.js   │            │└───────────────────┘│
└───────────────┘         └─────────────┘            └─────────────────────┘
</pre>

### Workflow

1) The mock service initiates a __Web Chat__ instance with a local instance of the __Direct Line API__
2) As the mock service loads, the __comands_map.server__ object will override the default __Direct Line API__ to connect to the local instance
3) __uitest.js__ will run the [Nightmare.js](http://www.nightmarejs.org/) with [Mocha.js](https://mochajs.org/) tests in __commands_map.client__ instead.

## NPM scripts

Here are the __npm__ commands to setup test the environment quickly (from the root directory):

### Run everything magically

We need to perform two tasks, 1) Build the tests, and 2) start the mock server

1) Build the tests:
* __"npm run build-test"__ to build the test framework
* __"npm run build-test"__ command will compile [TypeScript](http://www.typescriptlang.org) in both /test and /test/mock_dl folders

    > Add a watcher - To re-build on every file change, use __"npm run build-test-watch"__

2) Start the mock server:
* __"npm test"__ OR __"npm run test"__ to start a mock server (Direct Line Service) which bridges communications between the Web Chat application in [Mocha.js](https://mochajs.org/) tests on the [Nightmare.js](http://www.Nightmare.js.org/) test framework.

The mock server will now automatically serve dummy data to the web chat instance, while the automated tests will run based off of the data. You can view the status of your tests from the terminal.

### How to run mock service and Nightmare test framework separately

* When it comes to run mock service and tests separately, __"node test/mock_dl/index.js\\"__ will run the mock server on default port of 3000.
* While running the mock service as a standalone service. It is possible to interact with Web Chat client UI manually by browsing to [http://localhost:3000/?domain=http://localhost:3000/mock](http://localhost:3000/?domain=http://localhost:3000/mock) with a web browser. For example, type in __"animation"__ to into the input box, Web Chat bot returns an [AnimationCard](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.animationcard.html).
* After the mock service is properly running, automates [Nightmare.js](http://www.Nightmare.js.org/) / [Mocha.js](https://mochajs.org/) tests with __"./node_modules/.bin/mocha test"__ command.

### Tips

* Always run __"npm run build-test"__ prior to any testing processes.
* Keep in mind that if mock server and [Nightmare.js](http://www.Nightmare.js.org/) / [Mocha.js](https://mochajs.org/) tests are both running separately, the mock server will occupy one terminal (process), tests will run from another terminal (process). If the mock server is interrupted, closed, killed, or force closed, the tests will fail intermediately.
> * __"npm run build-test-watch"__ will monitor file-system changes to perform automatic rebuilds, but the watch system will occupy a separate process thread on its own.
* While running [Nightmare.js](http://www.Nightmare.js.org/), press **Ctrl + C** to cancel it at any time during the process.
* While running [Nightmare.js](http://www.Nightmare.js.org/), make sure you do not have other processes or browser tabs / windows / processes are opening the same __localhost:3000__ url, otherwise tests will run into state of confusion by not knowing which browser instance to interact with. It will lead to inconsistent test results or test failures.
* Due to browser resource management constrains, while running [Nightmare.js] (http://www.Nightmare.js.org/) please do not minimize your browser window. It will pause browser activities, which would lead to test failures as well.

## Example - Write a "Hello World" test

Dummy data for our mock server is stored in two files, __server_content.ts__, and __comands_map.ts__.
We'll be editing these files to create our 'Hello World' example.

Add the following to [__server_content.ts__](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/server_content.ts) :

```Javascript
export var hello_world: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "Hello Bot World"
}
```
This will create the response when the bot sees "hello world" in the chat conversation.

Next, in [__commands_map.ts__](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/commands_map.ts) add the following:

```Javascript
// "hello world" would be the phrase expected by user input. It will map to the proper server_content.

"hello world": {
    client: function () {
        // UI TEST : looking for bot returns "Hello Bot World" in the message, and verify the action.
        return document.querySelector('.wc-message-wrapper:last-child .wc-message.wc-message-from-bot').innerHTML.indexOf('Hello Bot World') != -1;
    },
    server: function (res, sendActivity) {
        // tells mock server to trigger the "hello_world: dl.Message"
        sendActivity(res, server_content.hello_world);
    }
},
```
Save your changes, and run the following two commands:

1) __npm run build-test__
2) __npm_test__

You can view the automated test status from the terminal. If mock server was running separately, manually type in "hello world" in the Web Chat input box. The bot in the Web Chat will surely returns "Hello Bot World" as a reply.

---

## Other useful implementation details

In the __BotFramework-WebChat__ repo, key component files inside of the /test folders are:

> ### [/test/Mock_dl/index.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/mock_dl/index.ts)

This file contains the mock server itself and runs on [Node.js](https://nodejs.org/). It will load the __commands_map__ object to communicate through the __Direct Line API__ to the __Web Chat__ instance.

The mock server default port is set to localhost://3000. To resolve a port conflict, change listening port from __/test/mock_dl/server_config.json__.

```Javascript
module.exports = {
    "port": 3000, //default, change as required
    ....
}
```

This mock server will take commands from __/test/commands_map.js__ as UI test commands. (Please referring to __comands_map.ts__ for more information).

> ### [commands_map.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/commands_map.ts)

The __commands_map__ file contains the __commands_map__ object, which is responsible for both communication to the mock server and managing the [Nightmare.js](http://www.Nightmare.js.org/) / [Mocha.js](https://mochajs.org/) UI tests.

__uitest.js__ will be running at same time when mock service is running.  Inside, the __testAllCommands()__ of the method will trigger each hash key in the __commands_map__

For example,  __"animation"__ :

```Javascript
"animation": {
    client: function () {
        var source = document.querySelectorAll('img')[0].src;
        return source.indexOf("surface_anim.gif") >= 0;
    },
    server: function (res, sendActivity) {
        sendActivity(res, server_content.ani_card);
    }
},
```
__testAllCommands()__ will then trigger the __sendActivity()__ method by passing in a __server_content.ani_card__ object.

```Javascript
var bot: dl.User = {
    id: "bot",
    name: "botname"
}

export var ani_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.AnimationCard>{
            contentType: "application/vnd.microsoft.card.animation",
            content: {
                title: "title",
                subtitle: "animation",
                text: "No buttons, No Image, Autoloop, Autostart, Sharable",
                media: [{ url: asset_url + "surface_anim.gif", profile: "animation" }],
                autoloop: true,
                autostart: true
            }
        }
    ]
}
```

3) The __ani_card__ object defines the properties for our card object to be passed through the __Direct Line API__.

4) The actual __Direct Line API__ overwrites comes from __dl.AnimationCard__ object as mock data. We then wrap this mock data response in __dl.Message__ triggers __Direct Line API__ to send a Message.

> ### [server_content.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/server_content.ts)

The __server_content.ts__ file contains [Rich Cards](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards) models overrides as mock data. Ensure that the module file structure structure has to matches the following:

> __/node-modules/botframework-Direct Linejs/src/Direct Line.ts__

> ### [test.html](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/test.html)

The __test.html__ is the HTML rendered instance of the Web Chat. Loading the Web Chat client is simply implemented in the HTML file per the following:

```Javascript
<link href="botchat.css" rel="stylesheet" />
<link href="botchat-fullwindow.css" rel="stylesheet" />
<script src="botchat.js"></script>
```

> ### [mock_dl/server_config.json](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/mock_dl/server_config.json)

The __mock_dl/server_config.json__ file provides the configuration for the UI tests.

> ### [uitest.js](https://github.com/Microsoft/BotFramework-WebChat/blob/master/test/uitest.js)

The __uitest.js__ file is where the [Mocha.js](https://mochajs.org/) tests are configured with [Nightmare.js](http://www.Nightmare.js.org/), and binds with [vo](https://github.com/matthewmueller/vo) (flow library) to enable batch testing every screen size in __widthTests__

---

## Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
