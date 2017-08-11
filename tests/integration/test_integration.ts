import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Application } from 'spectron';
import * as path from 'path';


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

    it("opens a window on launch", function() {
        return app.client.waitUntilWindowLoaded()
            .getWindowCount().should.eventually.equal(2)
            .browserWindow.isMinimized().should.eventually.be.false
            .browserWindow.isDevToolsOpened().should.eventually.be.false
            .browserWindow.isVisible().should.eventually.be.true
            .browserWindow.isFocused().should.eventually.be.true
            .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
            .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0)
    });

    it("has correct title", function() {
        return app.client.waitUntilWindowLoaded()
            .browserWindow.getTitle().should.eventually.equal("Bot Framework Channel Emulator");
    });

    // it("tests initial zoom level", function() {
    //     return app.client.waitUntilWindowLoaded()
    //         .webContents.getZoomLevel((level) => {level.should.eventually.equal(0)});
    // });
})