var restify = require('restify');
var builder = require('botbuilder');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//
// Main methods
//
function getCounter(session) {
    if (!session.dialogData.hasOwnProperty('counter')) {
        session.dialogData.counter = 0;
    }
    session.dialogData.counter++;
    return `Message #${session.dialogData.counter}`;
}

//
// Bots Dialogs
//
var mainDialog = new builder.IntentDialog();
mainDialog.matches(/\bspam\b/i, function(session, args, next) {
    let splt = session.message.text.split(' ');
    let spamAmount = Number(splt[1]) || 100;
    for (var i = 0; i < spamAmount; i++) {
        session.send(getCounter(session));
    }
});
mainDialog.onDefault(function(session, args, next) {
    session.send("%s, you said %s", getCounter(session), session.message.text);
});
bot.dialog('/', mainDialog);