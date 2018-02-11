"use strict";

const chai = require('chai');
const expect = chai.expect;
const { shell } = require('../built/Store.js');

chai.use(require('chai-subset'));

describe("shell", () => {
    it("should start with an empty input", () => {
        expect(shell(undefined, { type: undefined })).to.containSubset({
            input: ''
        });
    });
    it("should update when it's intitially updated", () => {
        expect(shell(undefined, { type: 'Update_Input', input: 'foo' })).to.containSubset({
            input: 'foo'
        });
    });
    it("should update when it's subsequently updated", () => {
        expect(shell({ input: 'foo' }, { type: 'Update_Input', input: 'bar' })).to.containSubset({
            input: 'bar'
        });
    });
    it("should clear when a message is sent", () => {
        expect(shell({ input: 'foo' }, { type: 'Send_Message' })).to.containSubset({
            input: ''
        });
    });
    it("should default to not sending typing", () => {
        expect(shell(undefined, { type: undefined })).to.containSubset({
            sendTyping: false
        });
    });
    it("should update sendTyping to true", () => {
        expect(shell(undefined, { type: 'Set_Send_Typing', sendTyping: true })).to.containSubset({
            sendTyping: true
        });
    });
    it("should update sendTyping to false", () => {
        expect(shell(undefined, { type: 'Set_Send_Typing', sendTyping: false })).to.containSubset({
            sendTyping: false
        });
    });
});
