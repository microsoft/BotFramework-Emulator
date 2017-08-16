import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Application } from 'spectron';
import * as path from 'path';


chai.use(chaiAsPromised);
chai.should();

describe("Connect to local bot", function(this: any) {
    var app: any;

    before(function() {
        let electronPath = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron');
        if (process.platform === 'win32') {
            electronPath += '.cmd';
        }
        let appPath = path.join(__dirname, '..', '..', 'app', 'server', 'main.js');
        app = new Application({
            path: electronPath,
            args: [appPath],
        });
        chaiAsPromised.transferPromiseness = app.transferPromiseness;
        return app.start();
    });

    after(function() {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it("sends a message to a local bot and gets a response", function() {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible(".addressbar-textbox input").should.eventually.be.true
            .isVisible(".addressbar-botcreds").should.eventually.be.false
            .setValue(".addressbar-textbox input", "http://localhost:3978/api/messages")
            .isVisible(".addressbar-botcreds").should.eventually.be.true
            .click('button[class="addressbar-botcreds-connect-button"]').pause(500)
            .setValue(".wc-shellinput", "repeat this back\n")
            .waitForVisible(".wc-message-group-content:nth-child(1) p").should.eventually.be.true
            .getText(".wc-message-group-content:nth-child(1) p").should.eventually.equal("Message #1, you said repeat this back");
    });
});