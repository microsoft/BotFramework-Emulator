# Microsoft Bot Framework Emulator vNext

## How to build

1. Install `lerna` via `npm install -g lerna`
2. Navigate to the root of the Emulator repo, run the command `lerna boostrap`
3. Navigate to `[ROOT]/packages/app/main` and run the command `npm run build`

**IMPORTANT:** Do **not** run `npm install` in any of the directories; lerna will take care of that for you with the `boostrap` command.

## How to run & develop locally

There are two, different work flows for local development depending on which directory you are working in. Refer to the **"Client side development"** section if you are modifying files within the `app/client` directory. Refer to the **"Server side development"** section if you are modifying files within both the `app/main` & `app/client` directories.

***

### Client side development (renderer process)

Open a terminal session inside of the `app/main` folder, and `npm run start`. This will start both the electron app and the webpack dev server that serves the UI.

Changes to the client side will cause the electron app to hot reload with the new code.

If after a while the electron app window comes up, but all you see is a white screen, this means that the electron app was booted before the dev server was up and running. **To fix this:** focus the electron app window, press `Ctrl + Shift + I` to bring up the dev tools window, focus the dev tools, and press `F5` to refresh the app. The window should now show the UI.

***

### Server side development (main process)

Open 3 terminals:

 - One in `app/client` (will be used to start the webpack dev server)
   - run `npm run start`
   - that's all you have to do; you shouldn't have to worry about the client side again unless you modify code in `app/shared` and rebuild the `shared` package

 - One in `app/main` (will be used to watch for changes on the main side and auto-compile the TypeScript)
   - run `npm build:electron -- --watch`
   - don't have to worry about this terminal anymore
 - Another in `app/main` (will be used to start and restart the main side after changes have been recompiled)
   - run `npm start:electron:dev`
   - this starts a new instance of the electron app with the most recently compiled `app/main` files
   - **To see app/main file changes:** `Ctrl + C` to kill the electron app, then `npm start:electron:dev` to restart it with your reflected changes

***
