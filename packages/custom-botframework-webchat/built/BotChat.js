"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
var App_1 = require("./App");
exports.App = App_1.App;
var Chat_1 = require("./Chat");
exports.Chat = Chat_1.Chat;
tslib_1.__exportStar(require("@bfemulator/custom-botframework-directlinejs"), exports);
var Attachment_1 = require("./Attachment");
exports.queryParams = Attachment_1.queryParams;
var SpeechOptions_1 = require("./SpeechOptions");
exports.SpeechOptions = SpeechOptions_1.SpeechOptions;
var SpeechModule_1 = require("./SpeechModule");
exports.Speech = SpeechModule_1.Speech;
var Store_1 = require("./Store");
exports.createStore = Store_1.createStore;
// below are shims for compatibility with old browsers (IE 10 being the main culprit)
require("core-js/modules/es6.string.starts-with");
require("core-js/modules/es6.array.find");
require("core-js/modules/es6.array.find-index");
//# sourceMappingURL=BotChat.js.map