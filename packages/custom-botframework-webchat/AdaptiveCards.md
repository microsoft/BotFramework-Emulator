# Adaptive Cards in Microsoft Bot Framework Web Chat

Web Chat now supports [Adaptive Cards](http://adaptivecards.io/), which you can use to achieve a greater level of rich display and interactivity in your bot's UX. Adaptive Cards are a general-purpose technology, which may be used in a wide variety of applications. In the Bot Framework, Adaptive Cards have certain limitations on each channel; this document outlines the constraints when using them within the Web Chat environment.

## Create and send an Adaptive Card from your bot

Please see the Bot Framework documentation site for examples of how to create and send an Adaptive Card from either [Node.js](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards#send-an-adaptive-card), [.NET](https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-add-rich-card-attachments#adaptive-card), or [REST](https://docs.microsoft.com/en-us/bot-framework/rest-api/bot-framework-rest-connector-add-rich-cards#a-idadaptive-carda-add-an-adaptive-card-to-a-message).

## Web Chat implementation details

### Actions

An Adaptive Card may provide [actions](http://adaptivecards.io/documentation/#create-cardschema) that define buttons that the user may tap. There are four types of Adaptive Card actions:

| Action Type | Implementation details |
|---|---|
| Action.OpenUrl  | Supported. Opens the URL in a new browser tab. |
| Action.ShowCard | Supported. May change the size of your card. |
| Action.Submit   | Supported. The `data` property of the action may be a string or it may be an object. A string is passed back to your bot as a Bot Builder SDK `imBack` activity, and an object is passed as a `postBack` activity. Activities with `imBack` appear in the chat stream as a user-entered reply. The `postBack` activities are not displayed. |
| Action.Http | **Not supported in Web Chat**. Web Chat filters out any actions that have the [Action.Http](http://adaptivecards.io/documentation/#action-http) type, and they are not be displayed. This filtering applies to actions on the root card and subcards. The recommendation is to use [Action.Submit](http://adaptivecards.io/documentation/#action-submit) instead, then execute any HTTP requests on the server side within your bot code. |

### Bot Builder SDK cards are now Adaptive

The existing Bot Builder SDK card types (Hero, Thumbnail, Audio, Video, Animation, SignIn, Receipt) are now implemented as Adaptive Cards. You may see some slight rendering differences from previous versions of Web Chat. However, as the card is adapted to the fields you've populated, the displayed card should be more natural for the user.

Bot Builder SDK cards may specify a  **tap** action on the entire card (Example: HeroCard [.NET](https://docs.microsoft.com/en-us/dotnet/api/microsoft.bot.connector.herocard?view=botbuilder-3.8) | [Node.js](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.herocard.html#tap) | [Rest](https://docs.microsoft.com/en-us/bot-framework/rest-api/bot-framework-rest-connector-api-reference#objects) ). Since Adaptive Cards have introduced interactive elements such as checkboxes, textboxes, and drop-down menus, the tap action is invoked only if the tap event occurs on a non-interactive element.

[Audio and Video are not yet part of the Adaptive Cards schema](https://github.com/Microsoft/AdaptiveCards/issues/196). So, Bot Builder SDK Audio and Video cards are implemented as a Media element followed by an Adaptive Card.

### Design considerations for Web Chat display

* Action buttons are displayed at full card width by default. Each button occupies its own vertical space. In previous versions of Web Chat, buttons followed a word-wrap layout. To ensure the entire card displays on the screen, we recommend not using more than five buttons.

* Adaptive Cards may define columns of data. It is common for a Web Chat control to be a sidebar or an otherwise narrow window. Having many columns may force a layout wider than the typical chat window.

* Unlike CSS media queries, Adaptive Cards do not currently have a layout model that is constrained by device size. We recommend limiting the number of columns in a card.

## Error handling

Your Adaptive Card is in JSON format and should adhere to the [Card schema](http://adaptivecards.io/documentation/#create-cardschema). If your JSON does not validate to the schema, then an error card is shown, and the error details outputted to the JavaScript console.

## Style customization

### Overview

It is important to understand how [Adaptive Cards separate the concerns of card content from presentation style](http://adaptivecards.io/documentation/#about-overview). The cards produced by your bot are purely semantic content, and the presentation style is driven by a [Host Configuration](http://adaptivecards.io/documentation/#display-hostconfigschema) JSON structure. Style aspects such as font, color, and margin sizes are specified in the Host Configuration.

> **Note:** Web Chat is unique in that it is the only Bot Framework channel where the bot developer can customize the look and feel of the channel. In other channels, the Adaptive Cards Host Configuration is not under the bot developer's control.

### Building your customization

The Adaptive Cards Host Configuration is stored in the `/adaptivecards-hostconfig.json` file in the root of this repo. This file's content is embedded into `/botchat.js` when you run the `npm run webpack` command. If you have created a Host Configuration file elsewhere, replace the contents of `/adaptivecards-hostconfig.json`, then run `npm run webpack`.

### Optional: Create using SCSS

You may wish to create your Host Configuration using SCSS in this repo. This method allows you to share variables (which may contain font, color, and margins) between CSS and the Adaptive Cards Host Configuration. Follow these steps to create your Host Configuration from SCSS:
1. Find the file `/src/scss/includes/adaptive-card-config.scss` and modify its contents.
2. Run the command `npm run build-ac-config`, which creates the `/adaptivecards-hostconfig.json` file for you from the SCSS source.
    * If you change an SCSS resource that is shared by both your CSS and the Adaptive Cards Host Configuration, such as `/src/scss/includes/colors.scss` or `/src/scss/includes/settings.scss`, you may wish to build both `/botchat.css` and `/adaptivecards-hostconfig.json` by running the command `npm run build-all-style` instead.

3. Embed the JSON file as previously described, by running `npm run webpack`.

### Optional: Embed without webpack

It is also possible to supply an Adaptive Cards Host Configuration without the need to webpack. Start with the [basic example from the readme](https://github.com/Microsoft/BotFramework-WebChat#easy-in-your-non-react-website-run-web-chat-inline), then add `adaptiveCardsHostConfig` prop when instantiating `BotChat.App`:

```HTML
<!DOCTYPE html>
<html>
  <head>
    <link href="https://cdn.botframework.com/botframework-webchat/latest/botchat.css" rel="stylesheet" />
  </head>
  <body>
    <div id="bot"/>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/botchat.js"></script>
    <script>
      BotChat.App({
        adaptiveCardsHostConfig: {
          fontFamily: '"Myriad Pro", sans-serif'
        },
        directLine: { secret: direct_line_secret },
        user: { id: 'userid' },
        bot: { id: 'botid' },
        resize: 'detect'
      }, document.getElementById("bot"));
    </script>
  </body>
</html>
```

Or alternatively, in React:

```jsx
<BotChat.Chat
  adaptiveCardsHostConfig={{ fontFamily: '"Myriad Prop", sans-serif' }}
  directLine={{ secret: direct_line_secret }}
  user={{ id: 'userid' }}
  bot={{ id: 'botid' }}
  resize="detect"
/>
```
