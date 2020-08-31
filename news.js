const builder = require(‘botbuilder’);
const env = process.env;
function init(app) {
// Create chat bot and binding
const connector = new builder.ChatConnector({
appId: env.BOT_APP_ID,
appPassword: env.BOT_APP_PASSWORD,
});
app.post(‘/api/news’, connector.listen());
const bot = new builder.UniversalBot(connector, (session) => {
session.send(‘Sorry, I did not understand \’%s\’. Send \’help\’ if you need assistance.’, session.message.text);
});
// Print out help message
bot.dialog(‘Help’, (session) => {
session.endDialog(‘Hi! this is a help message’);
}).triggerAction({
matches: ‘Help’,
});
}
module.exports.init = init;
