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

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Application } from 'spectron';
import * as path from 'path';
import * as testHelpers from '../testHelpers';


chai.use(chaiAsPromised);
chai.should();

describe("App", function(this: any) {
    var app: any;

    before(function() {
        let electronPath = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron');
        if (process.platform === 'win32') {
            electronPath += '.cmd';
        }
        let appPath = path.join(__dirname, '..', '..', 'app', 'server', 'main.js');
        app = new Application({
            path: electronPath,
            args: [
                appPath,
                `--storagepath=${testHelpers.tempLocalStore}`
            ],
        });
        chaiAsPromised.transferPromiseness = app.transferPromiseness;
        return app.start();
    });

    after(function() {
        testHelpers.cleanUpLocalStore();
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it("opens a window on launch", function() {
        return app.client.waitUntilWindowLoaded()
            .getWindowCount().should.eventually.equal(1)
            .browserWindow.isMinimized().should.eventually.be.false
            .browserWindow.isDevToolsOpened().should.eventually.be.false
            .browserWindow.isVisible().should.eventually.be.true
            .browserWindow.isFocused().should.eventually.be.true
            .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
            .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0)
    });

    it("has correct title", function() {
        return app.client
            .browserWindow.getTitle().should.eventually.equal("Bot Framework Emulator");
    });

    // it seems that getZoomLevel doesn't work without a patch to spectron. Raised an
    // issue on the electron github at https://github.com/electron/spectron/issues/222
    // it("tests initial zoom level", function() {
    //     console.log(app.client);
    //     return app.client.webContents.getZoomLevel().should.eventually.equal(0);
    // });

    it("can connect to a local bot", function() {
        return app.client
            .waitForVisible(".addressbar-textbox input").should.eventually.be.true
            .isVisible(".addressbar-botcreds").should.eventually.be.false
            .isVisible(".wc-shellinput").should.eventually.be.false
            .setValue(".addressbar-textbox input", "http://localhost:3978/api/messages")
            .isVisible(".addressbar-botcreds").should.eventually.be.true
            .click('button[class="addressbar-botcreds-connect-button"]').pause(500)
            .isVisible(".wc-shellinput").should.eventually.be.true
    });

    it("sends a message to a local bot and gets a response", function() {
        return app.client
            .setValue(".wc-shellinput", "repeat this back\n")
            .waitForVisible(".wc-message-wrapper:nth-child(2) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.equal("Message #1, you said repeat this back");
    });

    it("can open a payment window", function() {
        return app.client
            .setValue(".wc-shellinput", "payment\n")
            .waitForVisible(".wc-message-wrapper:nth-child(4) .wc-adaptive-card.hero").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child .ac-pushButton").should.eventually.equal("Buy")
            .click(".wc-message-wrapper:last-child .ac-pushButton").pause(500)
            .getWindowCount().should.eventually.equal(2);
    });

    it("can use a payment window", function() {
        return app.client.windowByIndex(1)
            .waitForVisible(".total-container .pay-button").should.eventually.be.true
            .getText(".total-container .pay-button").should.eventually.equal("Pay")
            .click(".total-container .pay-button")
            .getAttribute(".pay-with .checkout-selector", "class").should.eventually.include("invalid-input")
            .getAttribute(".ship-to .checkout-selector", "class").should.eventually.include("invalid-input")
            .getAttribute(".shipping-options .checkout-selector", "class").should.eventually.include("invalid-input")
            .click(".pay-with .checkout-selector").click(".pay-with .selector-items:last-child")
                .waitForVisible(".cardholder-name").should.eventually.be.true
                .setValue(".cardholder-name input", "Card holder name")
                .click(".checkout-button-bar .save-button") //for now fill out bare minimum
            .click(".ship-to .checkout-selector").click(".ship-to .selector-items:last-child")
                .waitForVisible(".recipient").should.eventually.be.true
                .setValue(".recipient input", "Recipient name")
                .click(".checkout-button-bar .save-button") //for now fill out bare minimum;
            .click(".shipping-options .checkout-selector").click(".shipping-options .selector-items:last-child")
            .setValue(".email-receipt-to input", "asdf@microsoft.com")
            .setValue(".phone input", "123-456-7890")
            .click(".total-container .pay-button").pause(500)
            .getWindowCount().should.eventually.equal(1)
            .windowByIndex(0).waitForVisible(".wc-message-wrapper:nth-child(5) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.equal("Completed payment");
    })
});
