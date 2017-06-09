import * as path from 'path';
import { Application } from 'spectron';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';


chai.should();
chai.use(chaiAsPromised);

describe('App', function(this: any) {
  let app: any;

  beforeEach(():Promise<Application> => {
    var electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
    if (process.platform === 'win32') {
        electronPath += '.cmd';
    }
    var appPath = path.join(__dirname, '..', 'app', 'server', 'main.js');
    app = new Application({
        path: electronPath,
        args: [appPath],
    });

    return app.start();
  });

  beforeEach(function () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
  });

  afterEach(() => {
    if (app && app.isRunning()) 
      return app.stop();
  });

  it("opens a window on launch", () => {
    return app.client.waitUntil(() => app.browserWindow.isVisible(), 5000)
      .browserWindow.isVisible().should.eventually.be.true
  })
})

describe('basic test on a string', () => {
    it("should be a string", function() {
        chai.expect("asdf").to.be.a("string");
    })
})