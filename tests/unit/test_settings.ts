import * as chai from 'chai';

import * as Settings from '../../src/server/settings';

chai.should();

describe("Settings", function() {
    it("#getSetting", function() {
        let settings: Settings.PersistentSettings = Settings.getSettings();
        settings.should.haveOwnProperty("windowState");
        settings.windowState.zoomLevel.should.equal(0);
    });
});