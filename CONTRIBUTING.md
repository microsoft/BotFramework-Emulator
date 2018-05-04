# Contributing

There are many ways to contribute to the Bot Framework Emulator project: reporting issues, submitting pull requests, and creating suggestions.

## Submitting Issues

The Bot Framework Emulator project tracks issues and feature requests using [GitHub issue tracker](https://github.com/BotBuilder-Emulator/issues).

### Before Submitting an Issue

First, please do a search in open issues to see if the issue or feature request has already been filed. If there is an existing issue, add your comments to that issue.

If your issue is a question, consider asking it on Stack Overflow using the tag `botbuilder`.

### Writing Great Issues and Suggestions
* Provide reproducible steps, what the result of the steps was, and what you would have expected to happen.
* Always file a single bug or feature request per issue. Do not list multiple bugs or requests in the same issue.
* Do not add your issue as a comment to an existing issue unless it's for the identical input. Many issues look similar, but have different causes.
* Include a screenshot or animated GIF.

Don't feel bad if we can't reproduce the issue and ask you for more information!

***

## How to build from source

### Clone the repo

```
git clone https://github.com/Microsoft/BotFramework-Emulator.git
```

### Checkout v4 branch
```
cd BotFramework-Emulator
git checkout v4
```

### Install global dependencies

> npm version 5.6.0 or greater is required.

```
npm install -g lerna@2.10.0
npm install -g gulp@4.0.0
npm install gulp-cli@2.0.1
```

### Install local dependencies

```
lerna bootstrap
```

> **IMPORTANT:** Do **not** run `npm install` in any of the directories; lerna will take care of that for you with the `bootstrap` command.

### Build all packages

```
cd packages/app/main
npm run build
```

## How to run & develop locally

There are two, different work flows for local development depending on which part of the project you are working in. Refer to the **"Client side development"** section if you are modifying files within the `packages/app/client` directory. Refer to the **"Server side development"** section if you are modifying files within both the `packages/app/main` & `packages/app/client` directories.

### Client side development (renderer process)

Open a terminal session inside of the `packages/app/main` folder, and `npm run start`. This will start both the electron app and the webpack dev server that serves the UI.

Changes to the client side will cause the electron app to hot reload with the new code.

If application window comes up, but all you see is a white screen, this means that the electron app was booted before the dev server was up and running. **To fix this:** focus the electron app window, press `Ctrl + Shift + I` to bring up the dev tools window, focus the dev tools, and press `F5` to refresh the app. The window should now show the UI.

### Server side development (main process)

Open 3 terminals:

 - One in `packages/app/client` (will be used to start the webpack dev server)
   - run `npm run start`
   - that's all you have to do; you shouldn't have to worry about the client side again unless you modify code in `packages/app/shared` and rebuild the `shared` package

 - One in `packages/app/main` (will be used to watch for changes on the main side and auto-compile the TypeScript)
   - run `npm build:electron -- --watch`
   - don't have to worry about this terminal anymore
 - Another in `packages/app/main` (will be used to start and restart the main side after changes have been recompiled)
   - run `npm start:electron:dev`
   - this starts a new instance of the electron app with the most recently compiled `packages/app/main` files
   - **To see app/main file changes:** `Ctrl + C` to kill the electron app, then `npm start:electron:dev` to restart it with your reflected changes

***

## Pull Requests

Before we can accept a pull request from you, you must agree to the [Contributor License Agreement (CLA)](https://github.com/Microsoft/BotFramework-Emulator/wiki/Contributor-License-Agreement). It is an automated process and you only need to do this once.

To enable us to quickly review and accept your pull requests, always create one pull request per issue and link the issue in the pull request. Never merge multiple requests in one unless they have the same root cause. Keep code changes as small as possible. Avoid pure formatting changes to code that has not been modified otherwise.
