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

    it("sets up emulator", function() {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible(".addressbar-textbox input").should.eventually.be.true
            .isVisible(".addressbar-botcreds").should.eventually.be.false
            .setValue(".addressbar-textbox input", "http://localhost:3978/api/messages")
            .isVisible(".addressbar-botcreds").should.eventually.be.true
            .click('button[class="addressbar-botcreds-connect-button"]').pause(500)
            .waitForVisible(".addressbar-textbox input").should.eventually.be.true;
    });

    it("times messages before spam", function() {
        return app.client
            .setValue(".wc-shellinput", "a\n")
            .waitForVisible(".wc-message-wrapper:nth-child(2) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said a")
            .setValue(".wc-shellinput", "b\n")
            .waitForVisible(".wc-message-wrapper:nth-child(4) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said b")
            .setValue(".wc-shellinput", "c\n")
            .waitForVisible(".wc-message-wrapper:nth-child(6) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said c")
            .setValue(".wc-shellinput", "d\n")
            .waitForVisible(".wc-message-wrapper:nth-child(8) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said d")
            .setValue(".wc-shellinput", "e\n")
            .waitForVisible(".wc-message-wrapper:nth-child(10) p").should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said e");
    })

    it("times performance of spamming messages", function() {
        return app.client
            .setValue(".wc-shellinput", "spam 250\n")
            .waitForVisible(".wc-message-wrapper:nth-child(261) p", 100000).should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.equal("Message #255");
    }).timeout(100000);

    it("times message sent after spam", function() {
        return app.client
            .setValue(".wc-shellinput", "f\n")
            .waitForVisible(".wc-message-wrapper:nth-child(263) p", 5000).should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said f")
            .setValue(".wc-shellinput", "g\n")
            .waitForVisible(".wc-message-wrapper:nth-child(265) p", 5000).should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said g")
            .setValue(".wc-shellinput", "h\n")
            .waitForVisible(".wc-message-wrapper:nth-child(267) p", 5000).should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said h")
            .setValue(".wc-shellinput", "i\n")
            .waitForVisible(".wc-message-wrapper:nth-child(269) p", 5000).should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said i")
            .setValue(".wc-shellinput", "j\n")
            .waitForVisible(".wc-message-wrapper:nth-child(271) p", 5000).should.eventually.be.true
            .getText(".wc-message-wrapper:last-child p").should.eventually.include("you said j");
    }).timeout(60000);
});
