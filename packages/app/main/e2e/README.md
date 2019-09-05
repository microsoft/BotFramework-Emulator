# Bot Framework Emulator End-to-End (e2e) Tests

## Pre-requisites

To run all the tests successfully , you must first install all the dependencies for the `e2e-test-bot`, and then run it before running the tests:

1. Navigate to the root directory of the project (ex. `~/home/GitProjects/BotFramework-Emulator`)
2. Run `npm run bootstrap:dev`
3. Run `npm run start:test-bot`

## Running the Tests

1. Make sure that the `e2e-test-bot` is running. (see step 3 of the "Pre-requisites" section)
2. Navigate to the root of the project (ex. `~/home/GitProjects/BotFramework-Emulator`)
3. Run `npm run test:e2e`

## Writing Tests

We are currently using Electron v4.1.1 which means that we are allowed to use Spectron ^6.0.0. Spectron 6 utilizes v4 (older version) of WebDriverIO, so make sure to navigate to the [correct documentation website!](http://v4.webdriver.io/api.html) Many of the new WebDriverIO APIs do not exist on the `client` object returned from our current version of Spectron, and you will have a painful time if you try to use the newer docs site as a reference.

> The `client` object is the same as the `browser` object referenced in the WebDriverIO docs.

Spectron is missing typings for all the functions on the `client` object, so it is difficult to know what is going to be returned from any of the function calls, and it takes a bit of trial and error to navigate the shape of the responses. I'd recommend looking at some of the already existing tests for examples on how to accomplish certain tasks, such as iterating through a list of DOM nodes, clicking a specific node, entering a value into an input, etc.
