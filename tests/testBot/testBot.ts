//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

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
function getCounter(session): string {
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

//
// Payments
//
mainDialog.matches(/\bpayment\b/i, function(session, args, next) {
    let buyCard = new builder.HeroCard(session);
    buyCard.title("Product card")
        .text("Press button to open payment window.")
        .buttons([
            {
                "title": "Buy",
                "type": "payment",
                "value": paymentRequest
            }
        ]);
    let message = new builder.Message(session);
    session.send(message.addAttachment(buyCard));
});
connector.onInvoke((invoke, callback) => {
    let storageCtx = {
        address: invoke.relatesTo,
        persistConversationData: true,
        conversationId: invoke.relatesTo.conversation.id
    };
  
    connector.getData(storageCtx, (err, data) => {
        switch (invoke.name) {
            case 'payments/update/shippingAddress':
            case 'payments/update/shippingOption':
                console.log("updatedshipping info");
                callback(null, {}, 200);
                break;

            case 'payments/complete':
                console.log("completed payment request");
                callback(null, {result: "success"}, 200);
                bot.beginDialog(invoke.relatesTo, 'checkout_receipt');
                break;
        }
    });
});

bot.dialog('checkout_receipt', function (session, args) {
    session.endDialog("Completed payment");
});

bot.dialog('checkout_failed', function (session, args) {
    session.endDialog('Could not process your payment: %s', args.errorMessage);
});

var paymentRequest = {
    id: "cartId",
    expires: '1.00:00:00',
    methodData: [{
        supportedMethods: ['https://pay.microsoft.com/microsoftpay'],
        data: {
            mode: 'TEST',
            merchantId: '12345678-abc1-23d4-5ef6-78a9b0c12d3d',
            supportedNetworks: ['visa', 'mastercard'],
            supportedTypes: ['credit']
        }
    }],
    details: {
        total: {
            label: 'Total',
            amount: { currency: 'USD', value: 1.99 },
            pending: true
        },
        displayItems: [
        {
            label: "Doodad",
            amount: { currency: 'USD', value: 1.99 }
        }, {
            label: 'Shipping',
            amount: { currency: 'USD', value: '0.00' },
            pending: true
        }, {
            label: 'Sales Tax',
            amount: { currency: 'USD', value: '0.00' },
            pending: true
        }],
        shippingOptions: [
        {
            "id": "GROUND",
            "label": "Ground",
            "amount": {
                "currency": "USD",
                "value": "8.95"
            }
        }, {
            "id": "AIR",
            "label": "Air",
            "amount": {
                "currency": "USD",
                "value": "24.99"
            }
        }]
    },
    options: {
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        requestShipping: true,
        shippingType: 'GROUND'
    }
}
