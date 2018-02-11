"use strict";

const chai = require('chai');
const expect = chai.expect;
const { history } = require('../built/Store.js');

chai.use(require('chai-subset'));

describe('history', () => {
    it('should start with an empty history', () => {
        expect(history(undefined, { type: undefined })).to.containSubset({
            activities: [],
            selectedActivity: null
        });
    });
});
