// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');

class E2ETestBot extends ActivityHandler {
  constructor() {
    super();

    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      const { text } = context.activity;

      switch (text.toLowerCase()) {
        case 'get user id':
          await context.sendActivity(context.activity.from.id);
          break;

        case 'hello':
          await context.sendActivity('Hello! :)');
          await context.sendActivity('How are you doing?');
          break;

        default:
          break;
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await context.sendActivity('Welcome to the e2e testing bot! :)');
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.E2ETestBot = E2ETestBot;
