# EAP Testing Instructions (Node Only)
## Prerequisites 
EAP Testing assumes you have a bot deployed to Azure configured to use the Teams channel.
## TL;DR
1. install [ngrok](https://ngrok.com/) locally then cd to it's location in a terminal
2. run ngrok `./ngrok http 3979 --host-header=localhost`
3. Open your bot in the azure portal, select the `settings` blade and paste the ngrok url provided in the terminal then save.
4. Clone the [BotBuilder-JS](https://github.com/Microsoft/botbuilder-js) repo 
5. `git checkout stevenic/4.4-planning`
6. install lerna: `npm i -g lerna` then run `lerna bootstrap --hoist && npm run build`
7. `cd samples/10. sidecarDebugging` and build using `npm run build`
8. set your environment variables (prefix with EXPORT for mac, SET for windows):
```bash
PORT=3979;
NODE_ENV=development;
MICROSOFT_APP_ID=<your app id>;
MICROSOFT_APP_PASSWORD=<your bot's password>;
EMULATOR_URL=http://localhost:9000;
```
9. Run your bot: `npm start`
10. Open the Teams chat link provided in the azure portal in the channels blade.
11. checkout the [Emulator](https://github.com/Microsoft/Botframework-emulator) branch`jwilaby/auto-connect-emulator`, build and run the Emulator as usual.
12. In the Emulator, go to the view menu and select "Sidecar debug mode" the begin chatting with your bot in teams.

# Run Your Bot in a Channel While Debugging Locally
 If you have configured your bot to [run in 1 or more channels](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-channels?view=azure-bot-service-4.0) and would like to test a locally running bot using the Emulator while interacting with it in a communication app (Teams, Skype, Slack, WebChat, etc.), these instructions will show you how.
 
Since chat messages, adaptive cards, and other features have notable differences across the many available channels, the Emulator cannot reasonably account for all of them. This guide shows you how to have a locally running bot where changes can be made quickly, breakpoints can be set and the project can be rebuilt and restarted while interacting with it via an installed app like Teams or Slack.
 
 # How it works
 The tunneling software [ngrok](https://ngrok.com/) is used to create a tunnel to your locally running bot. The tunnel's URL is provided to your web app bot in Azure. You build your bot with an Emulator aware Adapter, run it locally then chat with it in Teams or any other available channel. The Emulator still receives the conversation's message exchange as usual.
 
 # Let's get Started
 If you haven't already, get the [latest Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases), [ngrok](https://ngrok.com/) and update your bot's dependencies to use BotBuilder v4.4+
 
 ## 1. Update Your Bot's Code
 Your bot will need to become "Emulator Aware" in order to connect to and send the conversation exchange to the Emulator. Include the BotDebugger class somewhere in your bot's code:
 
<img width="354" alt="image" src="https://user-images.githubusercontent.com/2652885/55196481-b5355580-516c-11e9-84dd-facae6c26528.png">

Then set the `EMULATOR_URL` environment variable to `http://localhost:9000` prior to launching your bot. On a mac, this is done using this command:
```bash
export EMULATOR_URL=http://localhost:9000
```
Alternatively, you can refer to documentation in [VS Code](https://code.visualstudio.com/docs/editor/variables-reference#_environment-variables) for setting up environment variables in the launch configs for your bot.

 ## 2. Run ngrok 
 Open a terminal and run ngrok with the following command to create a new tunnel:
 ```bash
./ngrok http 3979 --host-header=localhost
``` 
 The output in the terminal should look something like this:
<img width="639" alt="image" src="https://user-images.githubusercontent.com/2652885/55196448-a2bb1c00-516c-11e9-87ce-98bdc1ebd7f8.png">

  ## 3. Update Azure to Point to the Tunnel
  In the azure portal, [navigate to your bot's settings](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-settings?view=azure-bot-service-4.0) and paste the 
  url provided by the ngrok terminal in the *Messaging endpoint* field and save the changes. Do not forget to use `/api/messages`. It's best to create a Bot in Azure that is used specifically for this purpose. Do not overwrite 
  the messaging endpoint of a deployed production bot.
  
  ## 4. Connect to a Channel
  If you haven't already done so, [connect your bot to a channel](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-channels?view=azure-bot-service-4.0). You may also need to download and install the app
  associated with the channel if you have't already.
  
  ## 5. Debug!
  Run your bot locally, then open the Emulator. In the Emulator choose file > Sidecar Debug Mode.

<img width="357" alt="image" src="https://user-images.githubusercontent.com/2652885/55196498-c8482580-516c-11e9-8276-e660593197c4.png">
 This will place the Emulator in a read only mode an enable inbound 
  connections from your locally running bot. Begin chatting with your bot in Teams, Skype, Slack or WebChat. Once the first message is received, your bot will connect
  to the Emulator and send it the conversation exchange.
