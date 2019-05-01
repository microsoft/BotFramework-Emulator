# Getting started with the Bot Inspector

[jump to Bot State Inspection](#bot-state-inspection)

## Prerequisites 
To test your bot in bot deployed to Azure configured to use the Teams channel.
[The latest Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases)

## TL;DR
1. Update your Emulator to be on version `4.4`. You can do this by selecting `Help` -> `Check for Update...`
1. Install [ngrok](https://ngrok.com/) and navigate to the ngrok executable's location in a terminal.
2. Run ngrok `./ngrok http 3979 --host-header=localhost`
3. Open your bot in the [Azure Portal](https://ms.portal.azure.com/), select the `Settings` blade and paste the ngrok url provided in the terminal into the *Messaging Endpoint* field then save. **note:** If necessary, don't forget to add the `/api/messages` endpoint.
4. Set the appropriate environment variables (prefix with EXPORT for OSX/Linux, SET for Windows):
```bash
NODE_ENV=development;
MICROSOFT_APP_ID=<your app id>;
MICROSOFT_APP_PASSWORD=<your bot's password>;
```
5. Run your bot: `npm start`
6. Open the Microsoft Teams chat link provided in the Azure Portal in the Channels blade.
7. Open the Emulator and toggle to Bot Inspector mode via `View` -> `Bot Inspector Mode`
8. Connect to your locally running Bot by pasting the URL to the Bot's endpoint in the connection modal.
9. Copy the `/INSPECT connect <UUID>` command rendered in the Conversation window and paste it into the Microsoft Teams chat.

# Run Your Bot in an external Channel and observing with the Bot Framework Emulator
If you have configured your bot to [run in 1 or more channels](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-channels?view=azure-bot-service-4.0) and would like to test a locally running bot using the Emulator while interacting with it in a communication app (Teams, Skype, Slack, WebChat, etc.), these instructions will show you how.

**note:** Since chat messages, Adaptive Cards, and other features have notable differences across the many available channels, the Emulator cannot visually recreate the experience inside the Emulator at this time. What we do expose is can see is protocol data and  internal bot state as turn context's execute throughout a conversation.

# How it works
The tunneling software [ngrok](https://ngrok.com/) is used to create a tunnel to your locally running bot. The tunnel's URL is provided to your Web App bot in Azure. You build your bot with the BotBuilder **4.4** [InspectionMiddleware](https://github.com/Microsoft/botbuilder-js/blob/1c790f4a4f0d761c215eb3841ff370f4b274f5d1/libraries/testbot/index.js#L21), and run it locally, chatting with it in Teams or another configured channel. The Emulator will receives the conversation's message exchange as usual, and some internal Bot State information now being exposed through this middleware.

# Let's get Started
If you haven't already, get the [latest Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases), [ngrok](https://ngrok.com/) and update your bot's dependencies to use BotBuilder v4.4+

## 1. Update Your Bot's Code
Your bot will need have the Bot Inspector middleware configured in order to connect to and send the conversation exchange to the Emulator. Include the [InspectionMiddleware](https://github.com/Microsoft/botbuilder-js/blob/1c790f4a4f0d761c215eb3841ff370f4b274f5d1/libraries/testbot/index.js#L21) in your Bot's middleware stack:

```javascript
let credentials = undefined;
if (appId && appPassword) {
  credentials = new MicrosoftAppCredentials(appId, appPassword);
}

adapter.use(new InspectionMiddleware(inspectionState, userState, conversationState, credentials))
```

## 2. Run ngrok 
Open a terminal and run ngrok with the following command to create a new tunnel:
```bash
./ngrok http 3979 --host-header=localhost
```
The output in the terminal should look something like this:
<img width="639" alt="image" src="https://user-images.githubusercontent.com/2652885/55196448-a2bb1c00-516c-11e9-87ce-98bdc1ebd7f8.png">

## 3. Update Azure to Point to the Tunnel
In the azure portal, [navigate to your bot's settings](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-settings?view=azure-bot-service-4.0) and paste the url provided by the ngrok terminal in the *Messaging endpoint* field and save the changes. Do not forget to use `/api/messages`. It's best to create a Bot in Azure that is used specifically for this purpose. Do not overwrite the messaging endpoint of a deployed production bot.

## 4. Set the appropiate environment variables in your Bot's running process & start the Bot
```bash
MicrosoftAppId=<your app id>;
MicrosoftAppPassword=<your bot's password>;
```
```bash
npm start
```

## 4. Connect to a Channel & start a converstion in it
If you haven't already done so, [connect your bot to a channel](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-channels?view=azure-bot-service-4.0). You may also need to download and install the app associated with the channel if you have't already. After that you can open the Microsoft Teams chat link provided in the Azure Portal in the Channels blade.

## 5. Start up the Emulator
Open the Emulator if it isn't open already. In the Emulator choose file > Bot Inspector Mode.

<img width="444" alt="Screen Shot 2019-04-30 at 2 48 50 PM" src="https://user-images.githubusercontent.com/1156704/56995648-2d6dad00-6b57-11e9-85f0-d0128bf32d7a.png">

## 6. Connect to your locally running Bot Open Bot -> Url

<img width="889" alt="Screen Shot 2019-04-30 at 2 50 14 PM" src="https://user-images.githubusercontent.com/1156704/56995693-4a09e500-6b57-11e9-917b-0178ea504f90.png">

## 7.  Copy the `/INSPECT connect <UUID>` command rendered in the Conversation window and paste it into the Microsoft Teams chat

<img width="895" alt="Screen Shot 2019-04-30 at 8 38 47 PM" src="https://user-images.githubusercontent.com/1156704/57004973-ac2f0e00-6b88-11e9-8d05-e627d50b791b.png">

## 8. Have conversation in Microsoft Teams chat

Have a normal conversation with your Bot in Microsoft Teams. While doing do you will see information populating in your connected conversation in the Emulator.

<img width="870" alt="Screen Shot 2019-04-30 at 2 55 49 PM" src="https://user-images.githubusercontent.com/1156704/56995966-1085a980-6b58-11e9-8f50-c410e2accafa.png">

# Bot State Inspection

The Bot Inspector now renders the Bot State for each Turn Context executed in the Bot's runtime. You can view this by selecting the `Bot State` element rendered in the Conversation control in JSON or Graph form.

<img width="991" alt="Screen Shot 2019-04-30 at 8 40 18 PM" src="https://user-images.githubusercontent.com/1156704/57004983-c1a43800-6b88-11e9-81ab-0ac412f4f96c.png">

You can view the difference between Bot State's by right-clicking on one of these Bot State elements and selecting the "view diff with previous" item.

<img width="509" alt="Screen Shot 2019-04-30 at 8 40 48 PM" src="https://user-images.githubusercontent.com/1156704/57004994-d41e7180-6b88-11e9-9cfe-18ddd4b53965.png">

<img width="656" alt="Screen Shot 2019-04-30 at 8 40 38 PM" src="https://user-images.githubusercontent.com/1156704/57004998-e13b6080-6b88-11e9-8b6c-d23cb8879ea2.png">
