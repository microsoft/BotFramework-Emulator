const { ActivityTypes, TurnContext, CardFactory, MemoryStorage, InputHints } = require('botbuilder-core');
const fetch = require('node-fetch');
const crypto = require('crypto');

/**
 * Key for accessing emulator specific data in memory
 * @type {string}
 */
const key = crypto
  .createHash('SHA256')
  .update(JSON.stringify(process.env))
  .digest()
  .toString('base64');

class EmulatorMiddleware {
  /**
   * @property {MemoryStorage} memoryStorage
   */

  /**
   * @property {MicrosoftAppCredentials} credentials
   */

  /**
   *
   * @param {MemoryStorage} memoryStorage
   * @param {MicrosoftAppCredentials} credentials
   */
  constructor(memoryStorage, credentials) {
    this.memoryStorage = memoryStorage;
    this.credentials = credentials;
    this.waitForEmulator();
  }

  waitForEmulator() {
    this.connectToEmulator().then(
      () => {
        debugger;
      },
      () => setTimeout(this.connectToEmulator.bind(this), 500)
    );
  }

  static async notifyConversation(context, text) {
    // Notify the user that the message was sent without
    // Reprocessing this message through the middleware
    const confirmationActivity = {
      type: ActivityTypes.Message,
      text,
      inputHint: InputHints.AcceptingInput,
    };
    const conversationReference = TurnContext.getConversationReference(context.activity);
    const payload = TurnContext.applyConversationReference(confirmationActivity, conversationReference);
    return context.adapter.sendActivities(context, [payload]);
  }

  /**
   * Processes the current turn containing the activity from the user
   *
   * @param {TurnContext} context The context of the current conversation turn.
   * @param {Function} next function that processes the next middleware in the queue
   */
  async onTurn(context, next) {
    const { type } = context.activity;

    switch (type) {
      case ActivityTypes.Message:
        return this.processMessage(context, next);

      case ActivityTypes.ConversationUpdate:
        return this.processConversationUpdate(context, next);

      default:
        return next();
    }
  }

  /**
   * Processes an inbound message from the user.
   *
   * @param {TurnContext} context The context of the current conversation turn.
   * @param {Function} next
   */
  async processMessage(context, next) {
    const { activity } = context;
    // Message from the adaptive card with the emulator url
    if (activity.value && activity.value.connect) {
      if (!activity.value.emulatorUrl) {
        await context.sendActivity('Please enter a url');
        return;
      }
      await this.updateMemory(context, activity.value);
      await this.connectToEmulator(context);
    } else {
      // Message from the user to forward to the Emulator if connected
      const conversationData = await this.getMemory(context);
      if (!conversationData) {
        return;
      }
      // Wait for the bot's response and send all messages at once.
      context.onSendActivities(async (ctx, activities, thisNext) => {
        await thisNext();
        try {
          await this.sendActivitiesToEmulator(context, [context.activity, ...activities]);
          await EmulatorMiddleware.notifyConversation(context, 'Activity exchange successfully sent to Emulator');
        } catch (e) {
          await EmulatorMiddleware.notifyConversation(context, 'Activity exchange failed to send to Emulator');
        }
      });
      return next();
    }
  }

  /**
   * Processes a conversation update
   *
   * @param {TurnContext} context
   * @param {Function} next
   */
  async processConversationUpdate(context, next) {
    const { activity } = context;
    const isGreeting = activity.membersAdded[0].name && activity.recipient.id !== activity.membersAdded[0].id;
    const memory = await this.getMemory(context);
    if (isGreeting && !memory.greetingGiven) {
      await this.updateMemory(context, { greetingGiven: true });

      await context.sendActivities([
        {
          attachments: [CardFactory.adaptiveCard(connectToEmulatorCard)],
        },
      ]);
    }
    return next();
  }

  async sendActivitiesToEmulator(context, activities) {
    const memory = await this.getMemory(context);
    const { emulatorConversationId } = memory;
    const url = `http://localhost:9000/v3/conversations/${emulatorConversationId}/activities`;
    const stream = activities.map(activity => {
      return fetch(url, {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
    });
    let chain = stream[0];
    let i = 1;
    for (; i < stream.length; i++) {
      chain = chain.then(stream[i]);
    }
    return chain;
  }

  async connectToEmulator() {
    const { appId: msaAppId, appPassword: msaPassword } = this.credentials;
    const url = `http://localhost:9000/v3/conversations?botEndpoint=http://localhost:${
      process.env.PORT
    }&msaAppId=${msaAppId}&msaPassword=${msaPassword}`;
    const payload = {
      bot: { id: 172 },
      endpoint: key,
      appId: msaAppId,
      appPassword: msaPassword,
    };
    const result = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (result.ok) {
      return result.json();
    } else {
      throw new Error('Connection attempt failed.');
    }
  }

  async updateMemory(context, data) {
    const { id: conversationId } = context.activity.conversation;
    const memory = await this.memoryStorage.read([conversationId]);
    const oldItem = memory[conversationId] || {};
    const store = oldItem[key];
    const newData = { ...store, ...data };
    memory[conversationId] = { ...oldItem, [key]: newData };
    return this.memoryStorage.write(memory);
  }

  async getMemory(context) {
    const { id: conversationId } = context.activity.conversation;
    const memory = await this.memoryStorage.read([conversationId]);
    return (memory[conversationId] || { [key]: {} })[key];
  }
}

const connectToEmulatorCard = {
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  type: 'AdaptiveCard',
  version: '1.0',
  body: [
    {
      type: 'TextBlock',
      text: 'Connect to the BotFramework Emulator',
    },
    {
      type: 'Input.Text',
      id: 'emulatorUrl',
      placeholder: "Enter the Emulator's URL",
      maxLength: 200,
    },
  ],
  actions: [
    {
      type: 'Action.Submit',
      title: 'Connect',
      data: {
        connect: true,
      },
    },
  ],
};

module.exports = { EmulatorMiddleware };
