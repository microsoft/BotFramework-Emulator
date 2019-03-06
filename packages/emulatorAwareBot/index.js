const { MemoryStorage } = require('botbuilder-core');

const path = require('path');
const restify = require('restify');
const { default: chalk } = require('chalk');

const { BotFrameworkAdapter } = require('botbuilder');
const { EmulatorAwareBot } = require('./EmulatorAwareBot');
const { EmulatorMiddleware } = require('./EmulatorMiddleware');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const memoryStorage = new MemoryStorage();
const bot = new EmulatorAwareBot(memoryStorage);

const adapter = new BotFrameworkAdapter({
  appId: process.env.APP_ID,
  appPassword: process.env.APP_PASSWORD,
});
adapter.use(new EmulatorMiddleware(memoryStorage, adapter.credentials));

const server = restify.createServer();
server.listen(process.env.PORT, () => {
  process.stdout.write(`Bot is listening on port: ${chalk.blue(server.address().port)}`);
});

server.post('/api/messages', (req, res) => {
  return adapter.processActivity(req, res, bot.processTurnContext.bind(bot)).catch(res.error);
});
