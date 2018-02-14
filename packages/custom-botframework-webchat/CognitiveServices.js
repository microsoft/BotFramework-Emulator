(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CognitiveServices"] = factory();
	else
		root["CognitiveServices"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 58);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(31));
__export(__webpack_require__(32));
__export(__webpack_require__(10));
__export(__webpack_require__(33));
__export(__webpack_require__(1));
__export(__webpack_require__(34));
__export(__webpack_require__(11));
__export(__webpack_require__(2));
__export(__webpack_require__(35));
__export(__webpack_require__(36));
__export(__webpack_require__(37));
__export(__webpack_require__(38));
__export(__webpack_require__(39));
__export(__webpack_require__(40));
__export(__webpack_require__(41));
__export(__webpack_require__(12));
__export(__webpack_require__(42));
__export(__webpack_require__(43));
__export(__webpack_require__(13));
__export(__webpack_require__(5));
__export(__webpack_require__(14));
__export(__webpack_require__(15));
__export(__webpack_require__(44));
__export(__webpack_require__(45));
__export(__webpack_require__(46));
__export(__webpack_require__(47));


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(3);
/**
 * The error that is thrown when an argument passed in is null.
 *
 * @export
 * @class ArgumentNullError
 * @extends {Error}
 */
var ArgumentNullError = (function (_super) {
    tslib_1.__extends(ArgumentNullError, _super);
    /**
     * Creates an instance of ArgumentNullError.
     *
     * @param {string} argumentName Name of the argument that is null
     *
     * @memberOf ArgumentNullError
     */
    function ArgumentNullError(argumentName) {
        var _this = _super.call(this, argumentName) || this;
        _this.name = "ArgumentNull";
        _this.message = argumentName;
        return _this;
    }
    return ArgumentNullError;
}(Error));
exports.ArgumentNullError = ArgumentNullError;
/**
 * The error that is thrown when an invalid operation is performed in the code.
 *
 * @export
 * @class InvalidOperationError
 * @extends {Error}
 */
// tslint:disable-next-line:max-classes-per-file
var InvalidOperationError = (function (_super) {
    tslib_1.__extends(InvalidOperationError, _super);
    /**
     * Creates an instance of InvalidOperationError.
     *
     * @param {string} error The error
     *
     * @memberOf InvalidOperationError
     */
    function InvalidOperationError(error) {
        var _this = _super.call(this, error) || this;
        _this.name = "InvalidOperation";
        _this.message = error;
        return _this;
    }
    return InvalidOperationError;
}(Error));
exports.InvalidOperationError = InvalidOperationError;
/**
 * The error that is thrown when an object is disposed.
 *
 * @export
 * @class ObjectDisposedError
 * @extends {Error}
 */
// tslint:disable-next-line:max-classes-per-file
var ObjectDisposedError = (function (_super) {
    tslib_1.__extends(ObjectDisposedError, _super);
    /**
     * Creates an instance of ObjectDisposedError.
     *
     * @param {string} objectName The object that is disposed
     * @param {string} error The error
     *
     * @memberOf ObjectDisposedError
     */
    function ObjectDisposedError(objectName, error) {
        var _this = _super.call(this, error) || this;
        _this.name = objectName + "ObjectDisposed";
        _this.message = error;
        return _this;
    }
    return ObjectDisposedError;
}(Error));
exports.ObjectDisposedError = ObjectDisposedError;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CreateGuid = function () {
    var d = new Date().getTime();
    var guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
};
exports.CreateGuid = CreateGuid;
var CreateNoDashGuid = function () {
    return CreateGuid().replace(new RegExp("-", "g"), "").toUpperCase();
};
exports.CreateNoDashGuid = CreateNoDashGuid;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["__extends"] = __extends;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (immutable) */ __webpack_exports__["__rest"] = __rest;
/* harmony export (immutable) */ __webpack_exports__["__decorate"] = __decorate;
/* harmony export (immutable) */ __webpack_exports__["__param"] = __param;
/* harmony export (immutable) */ __webpack_exports__["__metadata"] = __metadata;
/* harmony export (immutable) */ __webpack_exports__["__awaiter"] = __awaiter;
/* harmony export (immutable) */ __webpack_exports__["__generator"] = __generator;
/* harmony export (immutable) */ __webpack_exports__["__exportStar"] = __exportStar;
/* harmony export (immutable) */ __webpack_exports__["__values"] = __values;
/* harmony export (immutable) */ __webpack_exports__["__read"] = __read;
/* harmony export (immutable) */ __webpack_exports__["__spread"] = __spread;
/* harmony export (immutable) */ __webpack_exports__["__await"] = __await;
/* harmony export (immutable) */ __webpack_exports__["__asyncGenerator"] = __asyncGenerator;
/* harmony export (immutable) */ __webpack_exports__["__asyncDelegator"] = __asyncDelegator;
/* harmony export (immutable) */ __webpack_exports__["__asyncValues"] = __asyncValues;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(22));
__export(__webpack_require__(23));
__export(__webpack_require__(24));
__export(__webpack_require__(25));
__export(__webpack_require__(26));
__export(__webpack_require__(27));
__export(__webpack_require__(28));
__export(__webpack_require__(29));
__export(__webpack_require__(30));
__export(__webpack_require__(9));


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Guid_1 = __webpack_require__(2);
var EventType;
(function (EventType) {
    EventType[EventType["Debug"] = 0] = "Debug";
    EventType[EventType["Info"] = 1] = "Info";
    EventType[EventType["Warning"] = 2] = "Warning";
    EventType[EventType["Error"] = 3] = "Error";
})(EventType = exports.EventType || (exports.EventType = {}));
var PlatformEvent = (function () {
    function PlatformEvent(eventType) {
        this.eventId = Guid_1.CreateNoDashGuid();
        this.eventTime = new Date().toISOString();
        this.eventType = eventType;
        this.metadata = {};
    }
    Object.defineProperty(PlatformEvent.prototype, "EventId", {
        get: function () {
            return this.eventId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformEvent.prototype, "EventTime", {
        get: function () {
            return this.eventTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformEvent.prototype, "EventType", {
        get: function () {
            return this.eventType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformEvent.prototype, "Metadata", {
        get: function () {
            return this.metadata;
        },
        enumerable: true,
        configurable: true
    });
    return PlatformEvent;
}());
exports.PlatformEvent = PlatformEvent;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// IMPORTANT - Dont publish internal modules.
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(50));
__export(__webpack_require__(51));
__export(__webpack_require__(7));
__export(__webpack_require__(52));
__export(__webpack_require__(8));
__export(__webpack_require__(53));
__export(__webpack_require__(17));
__export(__webpack_require__(56));
__export(__webpack_require__(57));


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AuthInfo = (function () {
    function AuthInfo(headerName, token) {
        this.headerName = headerName;
        this.token = token;
    }
    Object.defineProperty(AuthInfo.prototype, "HeaderName", {
        get: function () {
            return this.headerName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthInfo.prototype, "Token", {
        get: function () {
            return this.token;
        },
        enumerable: true,
        configurable: true
    });
    return AuthInfo;
}());
exports.AuthInfo = AuthInfo;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(3);
var Exports_1 = __webpack_require__(0);
var SpeechRecognitionEvent = (function (_super) {
    tslib_1.__extends(SpeechRecognitionEvent, _super);
    function SpeechRecognitionEvent(eventName, requestId, eventType) {
        if (eventType === void 0) { eventType = Exports_1.EventType.Info; }
        var _this = _super.call(this, eventType) || this;
        _this.eventName = eventName;
        _this.requestId = requestId;
        return _this;
    }
    Object.defineProperty(SpeechRecognitionEvent.prototype, "Name", {
        get: function () {
            return this.eventName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechRecognitionEvent.prototype, "RequestId", {
        get: function () {
            return this.requestId;
        },
        enumerable: true,
        configurable: true
    });
    return SpeechRecognitionEvent;
}(Exports_1.PlatformEvent));
exports.SpeechRecognitionEvent = SpeechRecognitionEvent;
// tslint:disable-next-line:max-classes-per-file
var SpeechRecognitionResultEvent = (function (_super) {
    tslib_1.__extends(SpeechRecognitionResultEvent, _super);
    function SpeechRecognitionResultEvent(eventName, requestId, result) {
        var _this = _super.call(this, eventName, requestId) || this;
        _this.result = result;
        return _this;
    }
    Object.defineProperty(SpeechRecognitionResultEvent.prototype, "Result", {
        get: function () {
            return this.result;
        },
        enumerable: true,
        configurable: true
    });
    return SpeechRecognitionResultEvent;
}(SpeechRecognitionEvent));
exports.SpeechRecognitionResultEvent = SpeechRecognitionResultEvent;
// tslint:disable-next-line:max-classes-per-file
var RecognitionTriggeredEvent = (function (_super) {
    tslib_1.__extends(RecognitionTriggeredEvent, _super);
    function RecognitionTriggeredEvent(requestId, audioSourceId, audioNodeId) {
        var _this = _super.call(this, "RecognitionTriggeredEvent", requestId) || this;
        _this.audioSourceId = audioSourceId;
        _this.audioNodeId = audioNodeId;
        return _this;
    }
    Object.defineProperty(RecognitionTriggeredEvent.prototype, "AudioSourceId", {
        get: function () {
            return this.audioSourceId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionTriggeredEvent.prototype, "AudioNodeId", {
        get: function () {
            return this.audioNodeId;
        },
        enumerable: true,
        configurable: true
    });
    return RecognitionTriggeredEvent;
}(SpeechRecognitionEvent));
exports.RecognitionTriggeredEvent = RecognitionTriggeredEvent;
// tslint:disable-next-line:max-classes-per-file
var ListeningStartedEvent = (function (_super) {
    tslib_1.__extends(ListeningStartedEvent, _super);
    function ListeningStartedEvent(requestId, audioSourceId, audioNodeId) {
        var _this = _super.call(this, "ListeningStartedEvent", requestId) || this;
        _this.audioSourceId = audioSourceId;
        _this.audioNodeId = audioNodeId;
        return _this;
    }
    Object.defineProperty(ListeningStartedEvent.prototype, "AudioSourceId", {
        get: function () {
            return this.audioSourceId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListeningStartedEvent.prototype, "AudioNodeId", {
        get: function () {
            return this.audioNodeId;
        },
        enumerable: true,
        configurable: true
    });
    return ListeningStartedEvent;
}(SpeechRecognitionEvent));
exports.ListeningStartedEvent = ListeningStartedEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectingToServiceEvent = (function (_super) {
    tslib_1.__extends(ConnectingToServiceEvent, _super);
    function ConnectingToServiceEvent(requestId, authFetchEventid, connectionId) {
        var _this = _super.call(this, "ConnectingToServiceEvent", requestId) || this;
        _this.authFetchEventid = authFetchEventid;
        _this.connectionId = connectionId;
        return _this;
    }
    Object.defineProperty(ConnectingToServiceEvent.prototype, "AuthFetchEventid", {
        get: function () {
            return this.authFetchEventid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectingToServiceEvent.prototype, "ConnectionId", {
        get: function () {
            return this.connectionId;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectingToServiceEvent;
}(SpeechRecognitionEvent));
exports.ConnectingToServiceEvent = ConnectingToServiceEvent;
// tslint:disable-next-line:max-classes-per-file
var RecognitionStartedEvent = (function (_super) {
    tslib_1.__extends(RecognitionStartedEvent, _super);
    function RecognitionStartedEvent(requestId, audioSourceId, audioNodeId, authFetchEventId, connectionId) {
        var _this = _super.call(this, "RecognitionStartedEvent", requestId) || this;
        _this.audioSourceId = audioSourceId;
        _this.audioNodeId = audioNodeId;
        _this.authFetchEventId = authFetchEventId;
        _this.connectionId = connectionId;
        return _this;
    }
    Object.defineProperty(RecognitionStartedEvent.prototype, "AudioSourceId", {
        get: function () {
            return this.audioSourceId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionStartedEvent.prototype, "AudioNodeId", {
        get: function () {
            return this.audioNodeId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionStartedEvent.prototype, "AuthFetchEventId", {
        get: function () {
            return this.authFetchEventId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionStartedEvent.prototype, "ConnectionId", {
        get: function () {
            return this.connectionId;
        },
        enumerable: true,
        configurable: true
    });
    return RecognitionStartedEvent;
}(SpeechRecognitionEvent));
exports.RecognitionStartedEvent = RecognitionStartedEvent;
// tslint:disable-next-line:max-classes-per-file
var SpeechStartDetectedEvent = (function (_super) {
    tslib_1.__extends(SpeechStartDetectedEvent, _super);
    function SpeechStartDetectedEvent(requestId, result) {
        return _super.call(this, "SpeechStartDetectedEvent", requestId, result) || this;
    }
    return SpeechStartDetectedEvent;
}(SpeechRecognitionResultEvent));
exports.SpeechStartDetectedEvent = SpeechStartDetectedEvent;
// tslint:disable-next-line:max-classes-per-file
var SpeechHypothesisEvent = (function (_super) {
    tslib_1.__extends(SpeechHypothesisEvent, _super);
    function SpeechHypothesisEvent(requestId, result) {
        return _super.call(this, "SpeechHypothesisEvent", requestId, result) || this;
    }
    return SpeechHypothesisEvent;
}(SpeechRecognitionResultEvent));
exports.SpeechHypothesisEvent = SpeechHypothesisEvent;
// tslint:disable-next-line:max-classes-per-file
var SpeechEndDetectedEvent = (function (_super) {
    tslib_1.__extends(SpeechEndDetectedEvent, _super);
    function SpeechEndDetectedEvent(requestId, result) {
        return _super.call(this, "SpeechEndDetectedEvent", requestId, result) || this;
    }
    return SpeechEndDetectedEvent;
}(SpeechRecognitionResultEvent));
exports.SpeechEndDetectedEvent = SpeechEndDetectedEvent;
// tslint:disable-next-line:max-classes-per-file
var SpeechSimplePhraseEvent = (function (_super) {
    tslib_1.__extends(SpeechSimplePhraseEvent, _super);
    function SpeechSimplePhraseEvent(requestId, result) {
        return _super.call(this, "SpeechSimplePhraseEvent", requestId, result) || this;
    }
    return SpeechSimplePhraseEvent;
}(SpeechRecognitionResultEvent));
exports.SpeechSimplePhraseEvent = SpeechSimplePhraseEvent;
// tslint:disable-next-line:max-classes-per-file
var SpeechDetailedPhraseEvent = (function (_super) {
    tslib_1.__extends(SpeechDetailedPhraseEvent, _super);
    function SpeechDetailedPhraseEvent(requestId, result) {
        return _super.call(this, "SpeechDetailedPhraseEvent", requestId, result) || this;
    }
    return SpeechDetailedPhraseEvent;
}(SpeechRecognitionResultEvent));
exports.SpeechDetailedPhraseEvent = SpeechDetailedPhraseEvent;
var RecognitionCompletionStatus;
(function (RecognitionCompletionStatus) {
    RecognitionCompletionStatus[RecognitionCompletionStatus["Success"] = 0] = "Success";
    RecognitionCompletionStatus[RecognitionCompletionStatus["AudioSourceError"] = 1] = "AudioSourceError";
    RecognitionCompletionStatus[RecognitionCompletionStatus["AudioSourceTimeout"] = 2] = "AudioSourceTimeout";
    RecognitionCompletionStatus[RecognitionCompletionStatus["AuthTokenFetchError"] = 3] = "AuthTokenFetchError";
    RecognitionCompletionStatus[RecognitionCompletionStatus["AuthTokenFetchTimeout"] = 4] = "AuthTokenFetchTimeout";
    RecognitionCompletionStatus[RecognitionCompletionStatus["UnAuthorized"] = 5] = "UnAuthorized";
    RecognitionCompletionStatus[RecognitionCompletionStatus["ConnectTimeout"] = 6] = "ConnectTimeout";
    RecognitionCompletionStatus[RecognitionCompletionStatus["ConnectError"] = 7] = "ConnectError";
    RecognitionCompletionStatus[RecognitionCompletionStatus["ClientRecognitionActivityTimeout"] = 8] = "ClientRecognitionActivityTimeout";
    RecognitionCompletionStatus[RecognitionCompletionStatus["UnknownError"] = 9] = "UnknownError";
})(RecognitionCompletionStatus = exports.RecognitionCompletionStatus || (exports.RecognitionCompletionStatus = {}));
// tslint:disable-next-line:max-classes-per-file
var RecognitionEndedEvent = (function (_super) {
    tslib_1.__extends(RecognitionEndedEvent, _super);
    function RecognitionEndedEvent(requestId, audioSourceId, audioNodeId, authFetchEventId, connectionId, serviceTag, status, error) {
        var _this = _super.call(this, "RecognitionEndedEvent", requestId, status === RecognitionCompletionStatus.Success ? Exports_1.EventType.Info : Exports_1.EventType.Error) || this;
        _this.audioSourceId = audioSourceId;
        _this.audioNodeId = audioNodeId;
        _this.connectionId = connectionId;
        _this.authFetchEventId = authFetchEventId;
        _this.serviceTag = serviceTag;
        return _this;
    }
    Object.defineProperty(RecognitionEndedEvent.prototype, "AudioSourceId", {
        get: function () {
            return this.audioSourceId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionEndedEvent.prototype, "AudioNodeId", {
        get: function () {
            return this.audioNodeId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionEndedEvent.prototype, "AuthFetchEventId", {
        get: function () {
            return this.authFetchEventId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionEndedEvent.prototype, "ConnectionId", {
        get: function () {
            return this.connectionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionEndedEvent.prototype, "ServiceTag", {
        get: function () {
            return this.serviceTag;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionEndedEvent.prototype, "Status", {
        get: function () {
            return this.status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognitionEndedEvent.prototype, "Error", {
        get: function () {
            return this.error;
        },
        enumerable: true,
        configurable: true
    });
    return RecognitionEndedEvent;
}(SpeechRecognitionEvent));
exports.RecognitionEndedEvent = RecognitionEndedEvent;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var WebsocketMessageAdapter = (function () {
    function WebsocketMessageAdapter(uri, connectionId, messageFormatter) {
        var _this = this;
        this.Open = function () {
            if (_this.connectionState === Exports_1.ConnectionState.Disconnected) {
                return Exports_1.PromiseHelper.FromError("Cannot open a connection that is in " + _this.connectionState + " state");
            }
            if (_this.connectionEstablishDeferral) {
                return _this.connectionEstablishDeferral.Promise();
            }
            _this.connectionEstablishDeferral = new Exports_1.Deferred();
            _this.connectionState = Exports_1.ConnectionState.Connecting;
            _this.websocketClient = new WebSocket(_this.uri);
            _this.receivingMessageQueue = new Exports_1.Queue();
            _this.disconnectDeferral = new Exports_1.Deferred();
            _this.sendMessageQueue = new Exports_1.Queue();
            _this.ProcessSendQueue();
            _this.OnEvent(new Exports_1.ConnectionStartEvent(_this.connectionId, _this.uri));
            _this.websocketClient.onopen = function (e) {
                _this.connectionState = Exports_1.ConnectionState.Connected;
                _this.OnEvent(new Exports_1.ConnectionEstablishedEvent(_this.connectionId));
                _this.connectionEstablishDeferral.Resolve(new Exports_1.ConnectionOpenResponse(200, ""));
            };
            _this.websocketClient.onerror = function (e) {
                // TODO: Understand what this is error is. Will we still get onClose ?
                if (_this.connectionState !== Exports_1.ConnectionState.Connecting) {
                    // TODO: Is this required ?
                    // this.OnEvent(new ConnectionErrorEvent(errorMsg, connectionId));
                }
            };
            _this.websocketClient.onclose = function (e) {
                if (_this.connectionState === Exports_1.ConnectionState.Connecting) {
                    _this.connectionState = Exports_1.ConnectionState.Disconnected;
                    _this.OnEvent(new Exports_1.ConnectionEstablishErrorEvent(_this.connectionId, e.code, e.reason));
                    _this.connectionEstablishDeferral.Resolve(new Exports_1.ConnectionOpenResponse(e.code, e.reason));
                }
                else {
                    _this.OnEvent(new Exports_1.ConnectionClosedEvent(_this.connectionId, e.code, e.reason));
                }
                _this.OnClose(e.code, e.reason);
            };
            _this.websocketClient.onmessage = function (e) {
                var networkReceivedTime = new Date().toISOString();
                if (_this.connectionState === Exports_1.ConnectionState.Connected) {
                    var deferred_1 = new Exports_1.Deferred();
                    // let id = ++this.idCounter;
                    _this.receivingMessageQueue.EnqueueFromPromise(deferred_1.Promise());
                    if (e.data instanceof Blob) {
                        var fileReader_1 = new FileReader();
                        fileReader_1.onload = function (le) {
                            var rawMessage = new Exports_1.RawWebsocketMessage(Exports_1.MessageType.Binary, fileReader_1.result);
                            _this.messageFormatter
                                .ToConnectionMessage(rawMessage)
                                .On(function (connectionMessage) {
                                _this.OnEvent(new Exports_1.ConnectionMessageReceivedEvent(_this.connectionId, networkReceivedTime, connectionMessage));
                                deferred_1.Resolve(connectionMessage);
                            }, function (error) {
                                // TODO: Events for these ?
                                deferred_1.Reject("Invalid binary message format. Error: " + error);
                            });
                        };
                        fileReader_1.onerror = function (ev) {
                            // TODO: Events for these ?
                            deferred_1.Reject("Binary message parse error");
                        };
                        fileReader_1.readAsArrayBuffer(e.data);
                    }
                    else {
                        var rawMessage = new Exports_1.RawWebsocketMessage(Exports_1.MessageType.Text, e.data);
                        _this.messageFormatter
                            .ToConnectionMessage(rawMessage)
                            .On(function (connectionMessage) {
                            _this.OnEvent(new Exports_1.ConnectionMessageReceivedEvent(_this.connectionId, networkReceivedTime, connectionMessage));
                            deferred_1.Resolve(connectionMessage);
                        }, function (error) {
                            // TODO: Events for these ?
                            deferred_1.Reject("Invalid text message format. Error: " + error);
                        });
                    }
                }
            };
            return _this.connectionEstablishDeferral.Promise();
        };
        this.Send = function (message) {
            if (_this.connectionState !== Exports_1.ConnectionState.Connected) {
                return Exports_1.PromiseHelper.FromError("Cannot send on connection that is in " + _this.connectionState + " state");
            }
            var messageSendStatusDeferral = new Exports_1.Deferred();
            var messageSendDeferral = new Exports_1.Deferred();
            _this.sendMessageQueue.EnqueueFromPromise(messageSendDeferral.Promise());
            _this.messageFormatter
                .FromConnectionMessage(message)
                .On(function (rawMessage) {
                messageSendDeferral.Resolve({
                    Message: message,
                    RawWebsocketMessage: rawMessage,
                    SendStatusDeferral: messageSendStatusDeferral,
                });
            }, function (error) {
                messageSendDeferral.Reject("Error formatting the message. " + error);
            });
            return messageSendStatusDeferral.Promise();
        };
        this.Read = function () {
            if (_this.connectionState !== Exports_1.ConnectionState.Connected) {
                return Exports_1.PromiseHelper.FromError("Cannot read on connection that is in " + _this.connectionState + " state");
            }
            return _this.receivingMessageQueue.Dequeue();
        };
        this.Close = function (reason) {
            if (_this.websocketClient) {
                if (_this.connectionState !== Exports_1.ConnectionState.Connected) {
                    _this.websocketClient.close(1000, reason ? reason : "Normal closure by client");
                }
            }
            else {
                var deferral = new Exports_1.Deferred();
                deferral.Resolve(true);
                return deferral.Promise();
            }
            return _this.disconnectDeferral.Promise();
        };
        this.SendRawMessage = function (sendItem) {
            try {
                _this.OnEvent(new Exports_1.ConnectionMessageSentEvent(_this.connectionId, new Date().toISOString(), sendItem.Message));
                _this.websocketClient.send(sendItem.RawWebsocketMessage.Payload);
                return Exports_1.PromiseHelper.FromResult(true);
            }
            catch (e) {
                return Exports_1.PromiseHelper.FromError("websocket send error: " + e);
            }
        };
        this.OnClose = function (code, reason) {
            var closeReason = "Connection closed. " + code + ": " + reason;
            _this.connectionState = Exports_1.ConnectionState.Disconnected;
            _this.disconnectDeferral.Resolve(true);
            _this.receivingMessageQueue.Dispose(reason);
            _this.receivingMessageQueue.DrainAndDispose(function (pendingReceiveItem) {
                // TODO: Events for these ?
                // Logger.Instance.OnEvent(new LoggingEvent(LogType.Warning, null, `Failed to process received message. Reason: ${closeReason}, Message: ${JSON.stringify(pendingReceiveItem)}`));
            }, closeReason);
            _this.sendMessageQueue.DrainAndDispose(function (pendingSendItem) {
                pendingSendItem.SendStatusDeferral.Reject(closeReason);
            }, closeReason);
        };
        this.ProcessSendQueue = function () {
            _this.sendMessageQueue
                .Dequeue()
                .On(function (sendItem) {
                _this.SendRawMessage(sendItem)
                    .On(function (result) {
                    sendItem.SendStatusDeferral.Resolve(result);
                    _this.ProcessSendQueue();
                }, function (sendError) {
                    sendItem.SendStatusDeferral.Reject(sendError);
                    _this.ProcessSendQueue();
                });
            }, function (error) {
                // do nothing
            });
        };
        this.OnEvent = function (event) {
            _this.connectionEvents.OnEvent(event);
            Exports_1.Events.Instance.OnEvent(event);
        };
        if (!uri) {
            throw new Exports_1.ArgumentNullError("uri");
        }
        if (!messageFormatter) {
            throw new Exports_1.ArgumentNullError("messageFormatter");
        }
        this.connectionEvents = new Exports_1.EventSource();
        this.connectionId = connectionId;
        this.messageFormatter = messageFormatter;
        this.connectionState = Exports_1.ConnectionState.None;
        this.uri = uri;
    }
    Object.defineProperty(WebsocketMessageAdapter.prototype, "State", {
        get: function () {
            return this.connectionState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebsocketMessageAdapter.prototype, "Events", {
        get: function () {
            return this.connectionEvents;
        },
        enumerable: true,
        configurable: true
    });
    return WebsocketMessageAdapter;
}());
exports.WebsocketMessageAdapter = WebsocketMessageAdapter;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var Guid_1 = __webpack_require__(2);
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Text"] = 0] = "Text";
    MessageType[MessageType["Binary"] = 1] = "Binary";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var ConnectionMessage = (function () {
    function ConnectionMessage(messageType, body, headers, id) {
        this.body = null;
        if (messageType === MessageType.Text && body && !(typeof (body) === "string")) {
            throw new Error_1.InvalidOperationError("Payload must be a string");
        }
        if (messageType === MessageType.Binary && body && !(body instanceof ArrayBuffer)) {
            throw new Error_1.InvalidOperationError("Payload must be ArrayBuffer");
        }
        this.messageType = messageType;
        this.body = body;
        this.headers = headers ? headers : {};
        this.id = id ? id : Guid_1.CreateNoDashGuid();
    }
    Object.defineProperty(ConnectionMessage.prototype, "MessageType", {
        get: function () {
            return this.messageType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessage.prototype, "Headers", {
        get: function () {
            return this.headers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessage.prototype, "Body", {
        get: function () {
            return this.body;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessage.prototype, "TextBody", {
        get: function () {
            if (this.messageType === MessageType.Binary) {
                throw new Error_1.InvalidOperationError("Not supported for binary message");
            }
            return this.body;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessage.prototype, "BinaryBody", {
        get: function () {
            if (this.messageType === MessageType.Text) {
                throw new Error_1.InvalidOperationError("Not supported for text message");
            }
            return this.body;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessage.prototype, "Id", {
        get: function () {
            return this.id;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionMessage;
}());
exports.ConnectionMessage = ConnectionMessage;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var Guid_1 = __webpack_require__(2);
var EventSource = (function () {
    function EventSource(metadata) {
        var _this = this;
        this.eventListeners = {};
        this.isDisposed = false;
        this.OnEvent = function (event) {
            if (_this.IsDisposed()) {
                throw (new Error_1.ObjectDisposedError("EventSource"));
            }
            if (_this.Metadata) {
                for (var paramName in _this.Metadata) {
                    if (paramName) {
                        if (event.Metadata) {
                            if (!event.Metadata[paramName]) {
                                event.Metadata[paramName] = _this.Metadata[paramName];
                            }
                        }
                    }
                }
            }
            for (var eventId in _this.eventListeners) {
                if (eventId && _this.eventListeners[eventId]) {
                    _this.eventListeners[eventId](event);
                }
            }
        };
        this.Attach = function (onEventCallback) {
            var id = Guid_1.CreateNoDashGuid();
            _this.eventListeners[id] = onEventCallback;
            return {
                Detach: function () {
                    delete _this.eventListeners[id];
                },
            };
        };
        this.AttachListener = function (listener) {
            return _this.Attach(listener.OnEvent);
        };
        this.IsDisposed = function () {
            return _this.isDisposed;
        };
        this.Dispose = function () {
            _this.eventListeners = null;
            _this.isDisposed = true;
        };
        this.metadata = metadata;
    }
    Object.defineProperty(EventSource.prototype, "Metadata", {
        get: function () {
            return this.metadata;
        },
        enumerable: true,
        configurable: true
    });
    return EventSource;
}());
exports.EventSource = EventSource;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var InMemoryStorage = (function () {
    function InMemoryStorage() {
        var _this = this;
        this.store = {};
        this.Get = function (key) {
            if (!key) {
                throw new Error_1.ArgumentNullError("key");
            }
            return _this.store[key];
        };
        this.GetOrAdd = function (key, valueToAdd) {
            if (!key) {
                throw new Error_1.ArgumentNullError("key");
            }
            if (_this.store[key] === undefined) {
                _this.store[key] = valueToAdd;
            }
            return _this.store[key];
        };
        this.Set = function (key, value) {
            if (!key) {
                throw new Error_1.ArgumentNullError("key");
            }
            _this.store[key] = value;
        };
        this.Remove = function (key) {
            if (!key) {
                throw new Error_1.ArgumentNullError("key");
            }
            if (_this.store[key] !== undefined) {
                delete _this.store[key];
            }
        };
    }
    return InMemoryStorage;
}());
exports.InMemoryStorage = InMemoryStorage;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var List = (function () {
    function List(list) {
        var _this = this;
        this.subscriptionIdCounter = 0;
        this.addSubscriptions = {};
        this.removeSubscriptions = {};
        this.disposedSubscriptions = {};
        this.disposeReason = null;
        this.Get = function (itemIndex) {
            _this.ThrowIfDisposed();
            return _this.list[itemIndex];
        };
        this.First = function () {
            return _this.Get(0);
        };
        this.Last = function () {
            return _this.Get(_this.Length() - 1);
        };
        this.Add = function (item) {
            _this.ThrowIfDisposed();
            _this.InsertAt(_this.list.length, item);
        };
        this.InsertAt = function (index, item) {
            _this.ThrowIfDisposed();
            if (index === 0) {
                _this.list.unshift(item);
            }
            else if (index === _this.list.length) {
                _this.list.push(item);
            }
            else {
                _this.list.splice(index, 0, item);
            }
            _this.TriggerSubscriptions(_this.addSubscriptions);
        };
        this.RemoveFirst = function () {
            _this.ThrowIfDisposed();
            return _this.RemoveAt(0);
        };
        this.RemoveLast = function () {
            _this.ThrowIfDisposed();
            return _this.RemoveAt(_this.Length() - 1);
        };
        this.RemoveAt = function (index) {
            _this.ThrowIfDisposed();
            return _this.Remove(index, 1)[0];
        };
        this.Remove = function (index, count) {
            _this.ThrowIfDisposed();
            var removedElements = _this.list.splice(index, count);
            _this.TriggerSubscriptions(_this.removeSubscriptions);
            return removedElements;
        };
        this.Clear = function () {
            _this.ThrowIfDisposed();
            _this.Remove(0, _this.Length());
        };
        this.Length = function () {
            _this.ThrowIfDisposed();
            return _this.list.length;
        };
        this.OnAdded = function (addedCallback) {
            _this.ThrowIfDisposed();
            var subscriptionId = _this.subscriptionIdCounter++;
            _this.addSubscriptions[subscriptionId] = addedCallback;
            return {
                Detach: function () {
                    delete _this.addSubscriptions[subscriptionId];
                },
            };
        };
        this.OnRemoved = function (removedCallback) {
            _this.ThrowIfDisposed();
            var subscriptionId = _this.subscriptionIdCounter++;
            _this.removeSubscriptions[subscriptionId] = removedCallback;
            return {
                Detach: function () {
                    delete _this.removeSubscriptions[subscriptionId];
                },
            };
        };
        this.OnDisposed = function (disposedCallback) {
            _this.ThrowIfDisposed();
            var subscriptionId = _this.subscriptionIdCounter++;
            _this.disposedSubscriptions[subscriptionId] = disposedCallback;
            return {
                Detach: function () {
                    delete _this.disposedSubscriptions[subscriptionId];
                },
            };
        };
        this.Join = function (seperator) {
            _this.ThrowIfDisposed();
            return _this.list.join(seperator);
        };
        this.ToArray = function () {
            var cloneCopy = Array();
            _this.list.forEach(function (val) {
                cloneCopy.push(val);
            });
            return cloneCopy;
        };
        this.Any = function (callback) {
            _this.ThrowIfDisposed();
            if (callback) {
                return _this.Where(callback).Length() > 0;
            }
            else {
                return _this.Length() > 0;
            }
        };
        this.All = function (callback) {
            _this.ThrowIfDisposed();
            return _this.Where(callback).Length() === _this.Length();
        };
        this.ForEach = function (callback) {
            _this.ThrowIfDisposed();
            for (var i = 0; i < _this.Length(); i++) {
                callback(_this.list[i], i);
            }
        };
        this.Select = function (callback) {
            _this.ThrowIfDisposed();
            var selectList = [];
            for (var i = 0; i < _this.list.length; i++) {
                selectList.push(callback(_this.list[i], i));
            }
            return new List(selectList);
        };
        this.Where = function (callback) {
            _this.ThrowIfDisposed();
            var filteredList = new List();
            for (var i = 0; i < _this.list.length; i++) {
                if (callback(_this.list[i], i)) {
                    filteredList.Add(_this.list[i]);
                }
            }
            return filteredList;
        };
        this.OrderBy = function (compareFn) {
            _this.ThrowIfDisposed();
            var clonedArray = _this.ToArray();
            var orderedArray = clonedArray.sort(compareFn);
            return new List(orderedArray);
        };
        this.OrderByDesc = function (compareFn) {
            _this.ThrowIfDisposed();
            return _this.OrderBy(function (a, b) { return compareFn(b, a); });
        };
        this.Clone = function () {
            _this.ThrowIfDisposed();
            return new List(_this.ToArray());
        };
        this.Concat = function (list) {
            _this.ThrowIfDisposed();
            return new List(_this.list.concat(list.ToArray()));
        };
        this.ConcatArray = function (array) {
            _this.ThrowIfDisposed();
            return new List(_this.list.concat(array));
        };
        this.IsDisposed = function () {
            return _this.list == null;
        };
        this.Dispose = function (reason) {
            if (!_this.IsDisposed()) {
                _this.disposeReason = reason;
                _this.list = null;
                _this.addSubscriptions = null;
                _this.removeSubscriptions = null;
                _this.TriggerSubscriptions(_this.disposedSubscriptions);
            }
        };
        this.ThrowIfDisposed = function () {
            if (_this.IsDisposed()) {
                throw new Error_1.ObjectDisposedError("List", _this.disposeReason);
            }
        };
        this.TriggerSubscriptions = function (subscriptions) {
            if (subscriptions) {
                for (var subscriptionId in subscriptions) {
                    if (subscriptionId) {
                        subscriptions[subscriptionId]();
                    }
                }
            }
        };
        this.list = [];
        // copy the list rather than taking as is.
        if (list) {
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var item = list_1[_i];
                this.list.push(item);
            }
        }
    }
    return List;
}());
exports.List = List;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["None"] = 0] = "None";
    PromiseState[PromiseState["Resolved"] = 1] = "Resolved";
    PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
})(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
var PromiseResult = (function () {
    function PromiseResult(promiseResultEventSource) {
        var _this = this;
        this.ThrowIfError = function () {
            if (_this.IsError) {
                throw _this.Error;
            }
        };
        promiseResultEventSource.On(function (result) {
            if (!_this.isCompleted) {
                _this.isCompleted = true;
                _this.isError = false;
                _this.result = result;
            }
        }, function (error) {
            if (!_this.isCompleted) {
                _this.isCompleted = true;
                _this.isError = true;
                _this.error = error;
            }
        });
    }
    Object.defineProperty(PromiseResult.prototype, "IsCompleted", {
        get: function () {
            return this.isCompleted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseResult.prototype, "IsError", {
        get: function () {
            return this.isError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseResult.prototype, "Error", {
        get: function () {
            return this.error;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseResult.prototype, "Result", {
        get: function () {
            return this.result;
        },
        enumerable: true,
        configurable: true
    });
    return PromiseResult;
}());
exports.PromiseResult = PromiseResult;
// tslint:disable-next-line:max-classes-per-file
var PromiseResultEventSource = (function () {
    function PromiseResultEventSource() {
        var _this = this;
        this.SetResult = function (result) {
            _this.onSetResult(result);
        };
        this.SetError = function (error) {
            _this.onSetError(error);
        };
        this.On = function (onSetResult, onSetError) {
            _this.onSetResult = onSetResult;
            _this.onSetError = onSetError;
        };
    }
    return PromiseResultEventSource;
}());
exports.PromiseResultEventSource = PromiseResultEventSource;
// tslint:disable-next-line:max-classes-per-file
var PromiseHelper = (function () {
    function PromiseHelper() {
    }
    return PromiseHelper;
}());
PromiseHelper.WhenAll = function (promises) {
    if (!promises || promises.length === 0) {
        throw new Error_1.ArgumentNullError("promises");
    }
    var deferred = new Deferred();
    var errors = [];
    var completedPromises = 0;
    var checkForCompletion = function () {
        completedPromises++;
        if (completedPromises === promises.length) {
            if (errors.length === 0) {
                deferred.Resolve(true);
            }
            else {
                deferred.Reject(errors.join(", "));
            }
        }
    };
    for (var _i = 0, promises_1 = promises; _i < promises_1.length; _i++) {
        var promise = promises_1[_i];
        promise.On(function (r) {
            checkForCompletion();
        }, function (e) {
            errors.push(e);
            checkForCompletion();
        });
    }
    return deferred.Promise();
};
PromiseHelper.FromResult = function (result) {
    var deferred = new Deferred();
    deferred.Resolve(result);
    return deferred.Promise();
};
PromiseHelper.FromError = function (error) {
    var deferred = new Deferred();
    deferred.Reject(error);
    return deferred.Promise();
};
exports.PromiseHelper = PromiseHelper;
// tslint:disable-next-line:max-classes-per-file
var Promise = (function () {
    function Promise(sink) {
        var _this = this;
        this.Result = function () {
            return _this.sink.Result;
        };
        this.ContinueWith = function (continuationCallback) {
            if (!continuationCallback) {
                throw new Error_1.ArgumentNullError("continuationCallback");
            }
            var continuationDeferral = new Deferred();
            _this.sink.on(function (r) {
                try {
                    var coninuationResult = continuationCallback(_this.sink.Result);
                    continuationDeferral.Resolve(coninuationResult);
                }
                catch (e) {
                    continuationDeferral.Reject("'Unhandled callback error: " + e + "'");
                }
            }, function (error) {
                try {
                    var coninuationResult = continuationCallback(_this.sink.Result);
                    continuationDeferral.Resolve(coninuationResult);
                }
                catch (e) {
                    continuationDeferral.Reject("'Unhandled callback error: " + e + ". InnerError: " + error + "'");
                }
            });
            return continuationDeferral.Promise();
        };
        this.OnSuccessContinueWith = function (continuationCallback) {
            if (!continuationCallback) {
                throw new Error_1.ArgumentNullError("continuationCallback");
            }
            var continuationDeferral = new Deferred();
            _this.sink.on(function (r) {
                try {
                    var coninuationResult = continuationCallback(r);
                    continuationDeferral.Resolve(coninuationResult);
                }
                catch (e) {
                    continuationDeferral.Reject("'Unhandled callback error: " + e + "'");
                }
            }, function (error) {
                continuationDeferral.Reject("'Unhandled callback error: " + error + "'");
            });
            return continuationDeferral.Promise();
        };
        this.ContinueWithPromise = function (continuationCallback) {
            if (!continuationCallback) {
                throw new Error_1.ArgumentNullError("continuationCallback");
            }
            var continuationDeferral = new Deferred();
            _this.sink.on(function (r) {
                try {
                    var continuationPromise = continuationCallback(_this.sink.Result);
                    if (!continuationPromise) {
                        throw new Error("'Contuniation callback did not return promise'");
                    }
                    continuationPromise.On(function (coninuationResult) {
                        continuationDeferral.Resolve(coninuationResult);
                    }, function (e) {
                        continuationDeferral.Reject(e);
                    });
                }
                catch (e) {
                    continuationDeferral.Reject("'Unhandled callback error: " + e + "'");
                }
            }, function (error) {
                try {
                    var continuationPromise = continuationCallback(_this.sink.Result);
                    if (!continuationPromise) {
                        throw new Error("Contuniation callback did not return promise");
                    }
                    continuationPromise.On(function (coninuationResult) {
                        continuationDeferral.Resolve(coninuationResult);
                    }, function (e) {
                        continuationDeferral.Reject(e);
                    });
                }
                catch (e) {
                    continuationDeferral.Reject("'Unhandled callback error: " + e + ". InnerError: " + error + "'");
                }
            });
            return continuationDeferral.Promise();
        };
        this.OnSuccessContinueWithPromise = function (continuationCallback) {
            if (!continuationCallback) {
                throw new Error_1.ArgumentNullError("continuationCallback");
            }
            var continuationDeferral = new Deferred();
            _this.sink.on(function (r) {
                try {
                    var continuationPromise = continuationCallback(r);
                    if (!continuationPromise) {
                        throw new Error("Contuniation callback did not return promise");
                    }
                    continuationPromise.On(function (coninuationResult) {
                        continuationDeferral.Resolve(coninuationResult);
                    }, function (e) {
                        continuationDeferral.Reject(e);
                    });
                }
                catch (e) {
                    continuationDeferral.Reject("'Unhandled callback error: " + e + "'");
                }
            }, function (error) {
                continuationDeferral.Reject("'Unhandled callback error: " + error + ".'");
            });
            return continuationDeferral.Promise();
        };
        this.On = function (successCallback, errorCallback) {
            if (!successCallback) {
                throw new Error_1.ArgumentNullError("successCallback");
            }
            if (!errorCallback) {
                throw new Error_1.ArgumentNullError("errorCallback");
            }
            _this.sink.on(successCallback, errorCallback);
            return _this;
        };
        this.Finally = function (callback) {
            if (!callback) {
                throw new Error_1.ArgumentNullError("callback");
            }
            var callbackWrapper = function (_) {
                callback();
            };
            return _this.On(callbackWrapper, callbackWrapper);
        };
        this.sink = sink;
    }
    return Promise;
}());
exports.Promise = Promise;
// tslint:disable-next-line:max-classes-per-file
var Deferred = (function () {
    function Deferred() {
        var _this = this;
        this.State = function () {
            return _this.sink.State;
        };
        this.Promise = function () {
            return _this.promise;
        };
        this.Resolve = function (result) {
            _this.sink.Resolve(result);
            return _this;
        };
        this.Reject = function (error) {
            _this.sink.Reject(error);
            return _this;
        };
        this.sink = new Sink();
        this.promise = new Promise(this.sink);
    }
    return Deferred;
}());
exports.Deferred = Deferred;
// tslint:disable-next-line:max-classes-per-file
var Sink = (function () {
    function Sink() {
        var _this = this;
        this.state = PromiseState.None;
        this.promiseResult = null;
        this.promiseResultEvents = null;
        this.successHandlers = [];
        this.errorHandlers = [];
        this.Resolve = function (result) {
            if (_this.state !== PromiseState.None) {
                throw new Error("'Cannot resolve a completed promise'");
            }
            _this.state = PromiseState.Resolved;
            _this.promiseResultEvents.SetResult(result);
            for (var i = 0; i < _this.successHandlers.length; i++) {
                _this.ExecuteSuccessCallback(result, _this.successHandlers[i], _this.errorHandlers[i]);
            }
            _this.DetachHandlers();
        };
        this.Reject = function (error) {
            if (_this.state !== PromiseState.None) {
                throw new Error("'Cannot reject a completed promise'");
            }
            _this.state = PromiseState.Rejected;
            _this.promiseResultEvents.SetError(error);
            for (var _i = 0, _a = _this.errorHandlers; _i < _a.length; _i++) {
                var errorHandler = _a[_i];
                _this.ExecuteErrorCallback(error, errorHandler);
            }
            _this.DetachHandlers();
        };
        this.on = function (successCallback, errorCallback) {
            if (successCallback == null) {
                successCallback = function (r) { return; };
            }
            if (_this.state === PromiseState.None) {
                _this.successHandlers.push(successCallback);
                _this.errorHandlers.push(errorCallback);
            }
            else {
                if (_this.state === PromiseState.Resolved) {
                    _this.ExecuteSuccessCallback(_this.promiseResult.Result, successCallback, errorCallback);
                }
                else if (_this.state === PromiseState.Rejected) {
                    _this.ExecuteErrorCallback(_this.promiseResult.Error, errorCallback);
                }
                _this.DetachHandlers();
            }
        };
        this.ExecuteSuccessCallback = function (result, successCallback, errorCallback) {
            try {
                successCallback(result);
            }
            catch (e) {
                _this.ExecuteErrorCallback("'Unhandled callback error: " + e + "'", errorCallback);
            }
        };
        this.ExecuteErrorCallback = function (error, errorCallback) {
            if (errorCallback) {
                try {
                    errorCallback(error);
                }
                catch (e) {
                    throw new Error("'Unhandled callback error: " + e + ". InnerError: " + error + "'");
                }
            }
            else {
                throw new Error("'Unhandled error: " + error + "'");
            }
        };
        this.DetachHandlers = function () {
            _this.errorHandlers = [];
            _this.successHandlers = [];
        };
        this.promiseResultEvents = new PromiseResultEventSource();
        this.promiseResult = new PromiseResult(this.promiseResultEvents);
    }
    Object.defineProperty(Sink.prototype, "State", {
        get: function () {
            return this.state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sink.prototype, "Result", {
        get: function () {
            return this.promiseResult;
        },
        enumerable: true,
        configurable: true
    });
    return Sink;
}());
exports.Sink = Sink;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var List_1 = __webpack_require__(13);
var Promise_1 = __webpack_require__(14);
var SubscriberType;
(function (SubscriberType) {
    SubscriberType[SubscriberType["Dequeue"] = 0] = "Dequeue";
    SubscriberType[SubscriberType["Peek"] = 1] = "Peek";
})(SubscriberType || (SubscriberType = {}));
var Queue = (function () {
    function Queue(list) {
        var _this = this;
        this.promiseStore = new List_1.List();
        this.isDrainInProgress = false;
        this.isDisposing = false;
        this.disposeReason = null;
        this.Enqueue = function (item) {
            _this.ThrowIfDispose();
            _this.EnqueueFromPromise(Promise_1.PromiseHelper.FromResult(item));
        };
        this.EnqueueFromPromise = function (promise) {
            _this.ThrowIfDispose();
            _this.promiseStore.Add(promise);
            promise.Finally(function () {
                while (_this.promiseStore.Length() > 0) {
                    if (!_this.promiseStore.First().Result().IsCompleted) {
                        break;
                    }
                    else {
                        var p = _this.promiseStore.RemoveFirst();
                        if (!p.Result().IsError) {
                            _this.list.Add(p.Result().Result);
                        }
                        else {
                            // TODO: Log as warning.
                        }
                    }
                }
            });
        };
        this.Dequeue = function () {
            _this.ThrowIfDispose();
            var deferredSubscriber = new Promise_1.Deferred();
            _this.subscribers.Add({ deferral: deferredSubscriber, type: SubscriberType.Dequeue });
            _this.Drain();
            return deferredSubscriber.Promise();
        };
        this.Peek = function () {
            _this.ThrowIfDispose();
            var deferredSubscriber = new Promise_1.Deferred();
            _this.subscribers.Add({ deferral: deferredSubscriber, type: SubscriberType.Peek });
            _this.Drain();
            return deferredSubscriber.Promise();
        };
        this.Length = function () {
            _this.ThrowIfDispose();
            return _this.list.Length();
        };
        this.IsDisposed = function () {
            return _this.subscribers == null;
        };
        this.DrainAndDispose = function (pendingItemProcessor, reason) {
            if (!_this.IsDisposed() && !_this.isDisposing) {
                _this.disposeReason = reason;
                _this.isDisposing = true;
                while (_this.subscribers.Length() > 0) {
                    var subscriber = _this.subscribers.RemoveFirst();
                    subscriber.deferral.Reject("Disposed");
                }
                for (var _i = 0, _a = _this.detachables; _i < _a.length; _i++) {
                    var detachable = _a[_i];
                    detachable.Detach();
                }
                if (_this.promiseStore.Length() > 0 && pendingItemProcessor) {
                    return Promise_1.PromiseHelper
                        .WhenAll(_this.promiseStore.ToArray())
                        .ContinueWith(function () {
                        _this.subscribers = null;
                        _this.list.ForEach(function (item, index) {
                            pendingItemProcessor(item);
                        });
                        _this.list = null;
                        return true;
                    });
                }
                else {
                    _this.subscribers = null;
                    _this.list = null;
                }
            }
            return Promise_1.PromiseHelper.FromResult(true);
        };
        this.Dispose = function (reason) {
            _this.DrainAndDispose(null, reason);
        };
        this.Drain = function () {
            if (!_this.isDrainInProgress && !_this.isDisposing) {
                _this.isDrainInProgress = true;
                while (_this.list.Length() > 0 && _this.subscribers.Length() > 0 && !_this.isDisposing) {
                    var subscriber = _this.subscribers.RemoveFirst();
                    if (subscriber.type === SubscriberType.Peek) {
                        subscriber.deferral.Resolve(_this.list.First());
                    }
                    else {
                        var dequeuedItem = _this.list.RemoveFirst();
                        subscriber.deferral.Resolve(dequeuedItem);
                    }
                }
                _this.isDrainInProgress = false;
            }
        };
        this.ThrowIfDispose = function () {
            if (_this.IsDisposed()) {
                if (_this.disposeReason) {
                    throw new Error_1.InvalidOperationError(_this.disposeReason);
                }
                throw new Error_1.ObjectDisposedError("Queue");
            }
            else if (_this.isDisposing) {
                throw new Error_1.InvalidOperationError("Queue disposing");
            }
        };
        this.list = list ? list : new List_1.List();
        this.detachables = [];
        this.subscribers = new List_1.List();
        this.detachables.push(this.list.OnAdded(this.Drain));
    }
    return Queue;
}());
exports.Queue = Queue;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(4);
var Exports_2 = __webpack_require__(0);
var Exports_3 = __webpack_require__(6);
var TestHooksParamName = "testhooks";
var ConnectionIdHeader = "X-ConnectionId";
var SpeechConnectionFactory = (function () {
    function SpeechConnectionFactory() {
        var _this = this;
        this.Create = function (config, authInfo, connectionId) {
            var endpoint = "";
            switch (config.RecognitionMode) {
                case Exports_3.RecognitionMode.Conversation:
                    endpoint = _this.Host + _this.ConversationRelativeUri;
                    break;
                case Exports_3.RecognitionMode.Dictation:
                    endpoint = _this.Host + _this.DictationRelativeUri;
                    break;
                default:
                    endpoint = _this.Host + _this.InteractiveRelativeUri; // default is interactive
                    break;
            }
            var queryParams = {
                format: Exports_3.SpeechResultFormat[config.Format].toString().toLowerCase(),
                language: config.Language,
            };
            if (_this.IsDebugModeEnabled) {
                queryParams[TestHooksParamName] = "1";
            }
            var headers = {};
            headers[authInfo.HeaderName] = authInfo.Token;
            headers[ConnectionIdHeader] = connectionId;
            return new Exports_1.WebsocketConnection(endpoint, queryParams, headers, new Exports_3.WebsocketMessageFormatter(), connectionId);
        };
    }
    Object.defineProperty(SpeechConnectionFactory.prototype, "Host", {
        get: function () {
            return Exports_2.Storage.Local.GetOrAdd("Host", "wss://speech.platform.bing.com");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionFactory.prototype, "InteractiveRelativeUri", {
        get: function () {
            return Exports_2.Storage.Local.GetOrAdd("InteractiveRelativeUri", "/speech/recognition/interactive/cognitiveservices/v1");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionFactory.prototype, "ConversationRelativeUri", {
        get: function () {
            return Exports_2.Storage.Local.GetOrAdd("ConversationRelativeUri", "/speech/recognition/conversation/cognitiveservices/v1");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionFactory.prototype, "DictationRelativeUri", {
        get: function () {
            return Exports_2.Storage.Local.GetOrAdd("DictationRelativeUri", "/speech/recognition/dictation/cognitiveservices/v1");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionFactory.prototype, "IsDebugModeEnabled", {
        get: function () {
            var value = Exports_2.Storage.Local.GetOrAdd("IsDebugModeEnabled", "false");
            return value.toLowerCase() === "true";
        },
        enumerable: true,
        configurable: true
    });
    return SpeechConnectionFactory;
}());
exports.SpeechConnectionFactory = SpeechConnectionFactory;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(System) {
Object.defineProperty(exports, "__esModule", { value: true });
var RecognitionMode;
(function (RecognitionMode) {
    RecognitionMode[RecognitionMode["Interactive"] = 0] = "Interactive";
    RecognitionMode[RecognitionMode["Conversation"] = 1] = "Conversation";
    RecognitionMode[RecognitionMode["Dictation"] = 2] = "Dictation";
})(RecognitionMode = exports.RecognitionMode || (exports.RecognitionMode = {}));
var SpeechResultFormat;
(function (SpeechResultFormat) {
    SpeechResultFormat[SpeechResultFormat["Simple"] = 0] = "Simple";
    SpeechResultFormat[SpeechResultFormat["Detailed"] = 1] = "Detailed";
})(SpeechResultFormat = exports.SpeechResultFormat || (exports.SpeechResultFormat = {}));
var RecognizerConfig = (function () {
    function RecognizerConfig(platformConfig, recognitionMode, language, format) {
        if (recognitionMode === void 0) { recognitionMode = RecognitionMode.Interactive; }
        if (language === void 0) { language = "en-us"; }
        if (format === void 0) { format = SpeechResultFormat.Simple; }
        this.recognitionMode = RecognitionMode.Interactive;
        this.speechConfig = platformConfig ? platformConfig : new SpeechConfig(new Context(null, null));
        this.recognitionMode = recognitionMode;
        this.language = language;
        this.format = format;
        this.recognitionActivityTimeout = recognitionMode === RecognitionMode.Interactive ? 8000 : 25000;
    }
    Object.defineProperty(RecognizerConfig.prototype, "RecognitionMode", {
        get: function () {
            return this.recognitionMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "Language", {
        get: function () {
            return this.language;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "Format", {
        get: function () {
            return this.format;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "SpeechConfig", {
        get: function () {
            return this.speechConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "RecognitionActivityTimeout", {
        get: function () {
            return this.recognitionActivityTimeout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "IsContinuousRecognition", {
        get: function () {
            return this.recognitionMode !== RecognitionMode.Interactive;
        },
        enumerable: true,
        configurable: true
    });
    return RecognizerConfig;
}());
exports.RecognizerConfig = RecognizerConfig;
// tslint:disable-next-line:max-classes-per-file
var SpeechConfig = (function () {
    function SpeechConfig(context) {
        var _this = this;
        this.Serialize = function () {
            return JSON.stringify(_this, function (key, value) {
                if (value && typeof value === "object") {
                    var replacement = {};
                    for (var k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            replacement[k && k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                        }
                    }
                    return replacement;
                }
                return value;
            });
        };
        this.context = context;
    }
    Object.defineProperty(SpeechConfig.prototype, "Context", {
        get: function () {
            return this.context;
        },
        enumerable: true,
        configurable: true
    });
    return SpeechConfig;
}());
exports.SpeechConfig = SpeechConfig;
// tslint:disable-next-line:max-classes-per-file
var Context = (function () {
    function Context(os, device) {
        this.system = new System();
        this.os = os;
        this.device = device;
    }
    Object.defineProperty(Context.prototype, "System", {
        get: function () {
            return this.system;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "OS", {
        get: function () {
            return this.os;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "Device", {
        get: function () {
            return this.device;
        },
        enumerable: true,
        configurable: true
    });
    return Context;
}());
exports.Context = Context;
// tslint:disable-next-line:max-classes-per-file
var System = (function () {
    function System() {
        // TODO: Tie this with the sdk Version somehow
        this.version = "1.0.00000";
    }
    Object.defineProperty(System.prototype, "Version", {
        get: function () {
            // Controlled by sdk
            return this.version;
        },
        enumerable: true,
        configurable: true
    });
    return System;
}());
exports.System = System;
// tslint:disable-next-line:max-classes-per-file
var OS = (function () {
    function OS(platform, name, version) {
        this.platform = platform;
        this.name = name;
        this.version = version;
    }
    Object.defineProperty(OS.prototype, "Platform", {
        get: function () {
            return this.platform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OS.prototype, "Name", {
        get: function () {
            return this.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OS.prototype, "Version", {
        get: function () {
            return this.version;
        },
        enumerable: true,
        configurable: true
    });
    return OS;
}());
exports.OS = OS;
// tslint:disable-next-line:max-classes-per-file
var Device = (function () {
    function Device(manufacturer, model, version) {
        this.manufacturer = manufacturer;
        this.model = model;
        this.version = version;
    }
    Object.defineProperty(Device.prototype, "Manufacturer", {
        get: function () {
            return this.manufacturer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Device.prototype, "Model", {
        get: function () {
            return this.model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Device.prototype, "Version", {
        get: function () {
            return this.version;
        },
        enumerable: true,
        configurable: true
    });
    return Device;
}());
exports.Device = Device;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(59)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.log = function (message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (typeof (window) !== 'undefined' && window["botchatDebug"] && message)
        console.log.apply(console, [message].concat(optionalParams));
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var konsole = __webpack_require__(18);
var CognitiveSpeech = __webpack_require__(21);
var SpeechRecognizer = (function () {
    function SpeechRecognizer(properties) {
        if (properties === void 0) { properties = {}; }
        var _this = this;
        this.audioStreamStartInitiated = false;
        this.isStreamingToService = false;
        this.onIntermediateResult = null;
        this.onFinalResult = null;
        this.onAudioStreamingToService = null;
        this.onRecognitionFailed = null;
        this.locale = null;
        this.actualRecognizer = null;
        this.properties = properties;
        var recognitionMode = CognitiveSpeech.RecognitionMode.Interactive;
        var format = CognitiveSpeech.SpeechResultFormat.Simple;
        var locale = properties.locale || 'en-US';
        var recognizerConfig = new CognitiveSpeech.RecognizerConfig(new CognitiveSpeech.SpeechConfig(new CognitiveSpeech.Context(new CognitiveSpeech.OS(navigator.userAgent, "Browser", null), new CognitiveSpeech.Device("WebChat", "WebChat", "1.0.00000"))), recognitionMode, // Speech.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
        locale, // Supported laguages are specific to each recognition mode. Refer to docs.
        format); // Speech.SpeechResultFormat.Simple (Options - Simple/Detailed)
        var authentication;
        if (properties.subscriptionKey) {
            authentication = new CognitiveSpeech.CognitiveSubscriptionKeyAuthentication(properties.subscriptionKey);
        }
        else if (properties.fetchCallback && properties.fetchOnExpiryCallback) {
            authentication = new CognitiveSpeech.CognitiveTokenAuthentication(function (authFetchEventId) {
                var d = new CognitiveSpeech.Deferred();
                _this.properties.fetchCallback(authFetchEventId).then(function (value) { return d.Resolve(value); }, function (err) { return d.Reject(err); });
                return d.Promise();
            }, function (authFetchEventId) {
                var d = new CognitiveSpeech.Deferred();
                _this.properties.fetchOnExpiryCallback(authFetchEventId).then(function (value) { return d.Resolve(value); }, function (err) { return d.Reject(err); });
                return d.Promise();
            });
        }
        else {
            throw 'Error: The CognitiveServicesSpeechRecognizer requires either a subscriptionKey or a fetchCallback and fetchOnExpiryCallback.';
        }
        if (window.navigator.getUserMedia) {
            this.actualRecognizer = CognitiveSpeech.CreateRecognizer(recognizerConfig, authentication);
        }
        else {
            console.error("This browser does not support speech recognition");
        }
    }
    SpeechRecognizer.prototype.warmup = function () {
    };
    SpeechRecognizer.prototype.startRecognizing = function () {
        var _this = this;
        if (!this.actualRecognizer) {
            this.log('ERROR: no recognizer?');
            return;
        }
        var eventhandler = function (event) {
            _this.log(event.Name);
            switch (event.Name) {
                case 'RecognitionTriggeredEvent':
                case 'ListeningStartedEvent':
                case 'SpeechStartDetectedEvent':
                case 'SpeechEndDetectedEvent':
                case 'SpeechDetailedPhraseEvent':
                case 'ConnectingToServiceEvent':
                    break;
                case 'RecognitionStartedEvent':
                    if (_this.onAudioStreamingToService) {
                        _this.onAudioStreamingToService();
                    }
                    _this.isStreamingToService = true;
                    break;
                case 'SpeechHypothesisEvent':
                    var hypothesisEvent = event;
                    _this.log('Hypothesis Result: ' + hypothesisEvent.Result.Text);
                    if (_this.onIntermediateResult) {
                        _this.onIntermediateResult(hypothesisEvent.Result.Text);
                    }
                    break;
                case 'SpeechSimplePhraseEvent':
                    var simplePhraseEvent = event;
                    if (CognitiveSpeech.RecognitionStatus[simplePhraseEvent.Result.RecognitionStatus] === CognitiveSpeech.RecognitionStatus.Success) {
                        if (_this.onFinalResult) {
                            _this.onFinalResult(simplePhraseEvent.Result.DisplayText);
                        }
                    }
                    else {
                        if (_this.onRecognitionFailed) {
                            _this.onRecognitionFailed();
                        }
                        _this.log('Recognition Status: ' + simplePhraseEvent.Result.RecognitionStatus.toString());
                    }
                    break;
                case 'RecognitionEndedEvent':
                    _this.isStreamingToService = false;
                    break;
                default:
                    _this.log(event.Name + " is unexpected");
            }
        };
        var speechContext = null;
        if (this.referenceGrammarId) {
            speechContext = JSON.stringify({
                dgi: {
                    Groups: [
                        {
                            Type: "Generic",
                            Hints: { ReferenceGrammar: this.referenceGrammarId }
                        }
                    ]
                }
            });
        }
        this.actualRecognizer.Recognize(eventhandler, speechContext);
    };
    SpeechRecognizer.prototype.speechIsAvailable = function () {
        return this.actualRecognizer != null;
    };
    SpeechRecognizer.prototype.stopRecognizing = function () {
        if (this.actualRecognizer != null) {
            this.actualRecognizer.AudioSource.TurnOff();
        }
        this.isStreamingToService = false;
    };
    SpeechRecognizer.prototype.log = function (message) {
        konsole.log('CognitiveServicesSpeechRecognizer: ' + message);
    };
    return SpeechRecognizer;
}());
exports.SpeechRecognizer = SpeechRecognizer;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var konsole = __webpack_require__(18);
var SynthesisGender;
(function (SynthesisGender) {
    SynthesisGender[SynthesisGender["Male"] = 0] = "Male";
    SynthesisGender[SynthesisGender["Female"] = 1] = "Female";
})(SynthesisGender = exports.SynthesisGender || (exports.SynthesisGender = {}));
;
var SpeechSynthesizer = (function () {
    function SpeechSynthesizer(properties) {
        this._requestQueue = null;
        this._isPlaying = false;
        this._helper = new CognitiveServicesHelper(properties);
        this._properties = properties;
        this._requestQueue = new Array();
    }
    SpeechSynthesizer.prototype.speak = function (text, lang, onSpeakingStarted, onSpeakingFinished) {
        var _this = this;
        if (onSpeakingStarted === void 0) { onSpeakingStarted = null; }
        if (onSpeakingFinished === void 0) { onSpeakingFinished = null; }
        this._requestQueue.push({
            isReadyToPlay: false,
            data: null,
            text: text,
            locale: lang,
            onSpeakingStarted: onSpeakingStarted,
            onSpeakingFinished: onSpeakingFinished
        });
        this.getSpeechData().then(function () {
            _this.playAudio();
        });
    };
    SpeechSynthesizer.prototype.stopSpeaking = function () {
        if (this._isPlaying) {
            this._requestQueue = [];
            this._isPlaying = false;
            if (this._audioElement && this._audioElement.state !== "closed") {
                this._audioElement.close();
            }
        }
    };
    SpeechSynthesizer.prototype.playAudio = function () {
        var _this = this;
        if (this._requestQueue.length == 0) {
            return;
        }
        var top = this._requestQueue[0];
        if (!top) {
            return;
        }
        if (!top.isReadyToPlay) {
            window.setTimeout(function () { return _this.playAudio(); }, 100);
            return;
        }
        if (!this._isPlaying) {
            this._isPlaying = true;
            if (!this._audioElement || this._audioElement.state === "closed") {
                this._audioElement = new AudioContext();
            }
            this._audioElement.decodeAudioData(top.data, function (buffer) {
                var source = _this._audioElement.createBufferSource();
                source.buffer = buffer;
                source.connect(_this._audioElement.destination);
                if (top.onSpeakingStarted) {
                    top.onSpeakingStarted();
                }
                source.start(0);
                source.onended = function (event) {
                    _this._isPlaying = false;
                    if (top.onSpeakingFinished) {
                        top.onSpeakingFinished();
                    }
                    _this._requestQueue = _this._requestQueue.slice(1, _this._requestQueue.length);
                    if (_this._requestQueue.length > 0) {
                        _this.playAudio();
                    }
                };
            }, function (ex) {
                _this.log(ex.message);
                _this._isPlaying = false;
                _this._requestQueue = _this._requestQueue.slice(1, _this._requestQueue.length);
                if (_this._requestQueue.length > 0) {
                    _this.playAudio();
                }
            });
        }
    };
    SpeechSynthesizer.prototype.getSpeechData = function () {
        var _this = this;
        if (this._requestQueue.length == 0) {
            return;
        }
        var latest = this._requestQueue[this._requestQueue.length - 1];
        return this._helper.fetchSpeechData(latest.text, latest.locale, this._properties).then(function (result) {
            latest.data = result;
            latest.isReadyToPlay = true;
        }, function (ex) {
            // Failed to get the speech data, ignore this item
            _this.log(ex);
            _this._requestQueue = _this._requestQueue.slice(0, _this._requestQueue.length - 1);
        });
    };
    SpeechSynthesizer.prototype.log = function (message) {
        konsole.log('CognitiveServicesSpeechSynthesis: ' + message);
    };
    return SpeechSynthesizer;
}());
exports.SpeechSynthesizer = SpeechSynthesizer;
var CognitiveServicesHelper = (function () {
    function CognitiveServicesHelper(props) {
        var _this = this;
        this._tokenURL = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
        this._synthesisURL = "https://speech.platform.bing.com/synthesize";
        this._outputFormat = "riff-16khz-16bit-mono-pcm";
        // source: https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/bingvoiceoutput
        this._femaleVoiceMap = {
            "ar-eg": "Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)",
            "ca-es": "Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)",
            "da-dk": "Microsoft Server Speech Text to Speech Voice (da-DK, HelleRUS)",
            "de-de": "Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)",
            "en-au": "Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)",
            "en-ca": "Microsoft Server Speech Text to Speech Voice (en-CA, Linda)",
            "en-gb": "Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)",
            "en-in": "Microsoft Server Speech Text to Speech Voice (en-IN, Heera, Apollo)",
            "en-us": "Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)",
            "es-es": "Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)",
            "es-mx": "Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)",
            "fi-fi": "Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)",
            "fr-ca": "Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)",
            "fr-fr": "Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)",
            "hi-in": "Microsoft Server Speech Text to Speech Voice (hi-IN, Kalpana, Apollo)",
            "ja-jp": "Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)",
            "ko-kr": "Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)",
            "nb-no": "Microsoft Server Speech Text to Speech Voice (nb-NO, HuldaRUS)",
            "nl-nl": "Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)",
            "pl-pl": "Microsoft Server Speech Text to Speech Voice (pl-PL, PaulinaRUS)",
            "pt-br": "Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)",
            "pt-pt": "Microsoft Server Speech Text to Speech Voice (pt-PT, HeliaRUS)",
            "ru-ru": "Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)",
            "sv-se": "Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)",
            "tr-tr": "Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)",
            "zh-cn": "Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)",
            "zh-hk": "Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)",
            "zh-tw": "Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)"
        };
        this._maleVoiceMap = {
            "ar-sa": "Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)",
            "cs-cz": "Microsoft Server Speech Text to Speech Voice (cs-CZ, Vit)",
            "de-at": "Microsoft Server Speech Text to Speech Voice (de-AT, Michael)",
            "de-ch": "Microsoft Server Speech Text to Speech Voice (de-CH, Karsten)",
            "de-de": "Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)",
            "el-gr": "Microsoft Server Speech Text to Speech Voice (el-GR, Stefanos)",
            "en-gb": "Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)",
            "en-ie": "Microsoft Server Speech Text to Speech Voice (en-IE, Shaun)",
            "en-in": "Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)",
            "en-us": "Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)",
            "es-es": "Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)",
            "es-mx": "Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)",
            "fr-ch": "Microsoft Server Speech Text to Speech Voice (fr-CH, Guillaume)",
            "fr-fr": "Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)",
            "he-il": "Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)",
            "hi-in": "Microsoft Server Speech Text to Speech Voice (hi-IN, Hemant)",
            "hu-hu": "Microsoft Server Speech Text to Speech Voice (hu-HU, Szabolcs)",
            "id-id": "Microsoft Server Speech Text to Speech Voice (id-ID, Andika)",
            "it-it": "Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)",
            "ja-jp": "Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)",
            "pt-br": "Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)",
            "ro-ro": "Microsoft Server Speech Text to Speech Voice (ro-RO, Andrei)",
            "ru-ru": "Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)",
            "sk-sk": "Microsoft Server Speech Text to Speech Voice (sk-SK, Filip)",
            "th-th": "Microsoft Server Speech Text to Speech Voice (th-TH, Pattara)",
            "zh-cn": "Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)",
            "zh-hk": "Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)",
            "zh-tw": "Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)"
        };
        if (props.subscriptionKey) {
            this._tokenCallback = function (id) { return _this.fetchSpeechToken(id); };
            this._tokenExpiredCallback = function (id) { return _this.fetchSpeechToken(id); };
        }
        else if (props.fetchCallback && props.fetchOnExpiryCallback) {
            this._tokenCallback = props.fetchCallback;
            this._tokenExpiredCallback = props.fetchOnExpiryCallback;
        }
        else {
            throw 'Error: The CognitiveServicesSpeechSynthesis requires either a subscriptionKey or a fetchCallback and a fetchOnExpiryCallback.';
        }
    }
    CognitiveServicesHelper.prototype.fetchSpeechData = function (text, locale, synthesisProperties) {
        var _this = this;
        var SSML = this.makeSSML(text, locale, synthesisProperties);
        var cbAfterToken = function (token) {
            _this._lastTokenTime = Date.now();
            var optionalHeaders = [{ name: "Content-type", value: 'application/ssml+xml' },
                { name: "X-Microsoft-OutputFormat", value: _this._outputFormat },
                { name: "Authorization", value: token }];
            return _this.makeHttpCall("POST", _this._synthesisURL, true, optionalHeaders, SSML);
        };
        if (Date.now() - this._lastTokenTime > 500000) {
            return this._tokenExpiredCallback(synthesisProperties.subscriptionKey).then(function (token) { return cbAfterToken(token); });
        }
        else {
            return this._tokenCallback(synthesisProperties.subscriptionKey).then(function (token) { return cbAfterToken(token); });
        }
    };
    CognitiveServicesHelper.prototype.makeSSML = function (text, locale, synthesisProperties) {
        if (text.indexOf("<speak") === 0) {
            return this.processSSML(text, synthesisProperties);
        }
        else {
            var ssml = "<speak version='1.0' xml:lang='" + locale + "'><voice xml:lang='" + locale + "' xml:gender='" + (synthesisProperties && synthesisProperties.gender ? SynthesisGender[synthesisProperties.gender] : "Female") + "' name='";
            if (synthesisProperties.voiceName) {
                ssml += synthesisProperties.voiceName;
            }
            else if (synthesisProperties.gender !== null && synthesisProperties.gender !== undefined) {
                ssml += this.fetchVoiceName(locale, synthesisProperties.gender);
            }
            else {
                ssml += this.fetchVoiceName(locale, SynthesisGender.Female);
            }
            return ssml + "'>" + this.encodeHTML(text) + "</voice></speak>";
        }
    };
    CognitiveServicesHelper.prototype.processSSML = function (ssml, synthesisProperties) {
        var processDone = false;
        // Extract locale info from ssml
        var locale;
        var match = /xml:lang=['"](\w\w-\w\w)['"]/.exec(ssml);
        if (match) {
            locale = match[1];
        }
        else {
            locale = "en-us";
        }
        // Extract gender from properties
        var gender = synthesisProperties && synthesisProperties.gender;
        if (gender === null || gender === undefined) {
            gender = SynthesisGender.Female;
        }
        var parser = new DOMParser();
        var dom = parser.parseFromString(ssml, 'text/xml');
        var nodes = dom.documentElement.childNodes;
        // Check if there is a voice node
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i].nodeName === "voice") {
                // Check if there is a name attribute on voice element
                for (var j = 0; j < nodes[i].attributes.length; ++j) {
                    if (nodes[i].attributes[j].nodeName === "name") {
                        // Name attribute is found on voice element, use it directly
                        processDone = true;
                        break;
                    }
                    // Find the gender info from voice element, this will override what is in the properties
                    if (nodes[i].attributes[j].nodeName === "xml:gender") {
                        gender = nodes[i].attributes[j].nodeValue.toLowerCase() === 'male' ? SynthesisGender.Male : SynthesisGender.Female;
                    }
                }
                if (!processDone) {
                    // Otherwise add the name attribute based on locale and gender
                    var attribute = dom.createAttribute("name");
                    attribute.value = (synthesisProperties && synthesisProperties.voiceName) || this.fetchVoiceName(locale, gender);
                    nodes[i].attributes.setNamedItem(attribute);
                    processDone = true;
                }
                break;
            }
        }
        var serializer = new XMLSerializer();
        if (!processDone) {
            // There is no voice element, add one based on locale
            var voiceNode = dom.createElement("voice");
            var attribute = dom.createAttribute("name");
            attribute.value = (synthesisProperties && synthesisProperties.voiceName) || this.fetchVoiceName(locale, gender);
            voiceNode.attributes.setNamedItem(attribute);
            while (nodes.length > 0) {
                voiceNode.appendChild(dom.documentElement.firstChild);
            }
            dom.documentElement.appendChild(voiceNode);
        }
        return serializer.serializeToString(dom);
    };
    CognitiveServicesHelper.prototype.encodeHTML = function (text) {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    CognitiveServicesHelper.prototype.fetchSpeechToken = function (apiKey) {
        var optionalHeaders = [{ name: "Ocp-Apim-Subscription-Key", value: apiKey },
            // required for Firefox otherwise a CORS error is raised
            { name: "Access-Control-Allow-Origin", value: "*" }];
        return this.makeHttpCall("POST", this._tokenURL, false, optionalHeaders).then(function (text) {
            konsole.log("New authentication token generated.");
            return Promise.resolve(text);
        }, function (ex) {
            var reason = "Failed to generate authentication token";
            konsole.log(reason);
            return Promise.reject(reason);
        });
    };
    CognitiveServicesHelper.prototype.makeHttpCall = function (actionType, url, isArrayBuffer, optionalHeaders, dataToSend) {
        if (isArrayBuffer === void 0) { isArrayBuffer = false; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            if (isArrayBuffer) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState !== 4)
                    return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (!isArrayBuffer) {
                        resolve(xhr.responseText);
                    }
                    else {
                        resolve(xhr.response);
                    }
                }
                else {
                    reject(xhr.status);
                }
            };
            try {
                xhr.open(actionType, url, true);
                if (optionalHeaders) {
                    optionalHeaders.forEach(function (header) {
                        xhr.setRequestHeader(header.name, header.value);
                    });
                }
                if (dataToSend) {
                    xhr.send(dataToSend);
                }
                else {
                    xhr.send();
                }
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    CognitiveServicesHelper.prototype.fetchVoiceName = function (locale, gender) {
        var voiceName;
        var localeLowerCase = locale.toLowerCase();
        if (gender === SynthesisGender.Female) {
            voiceName = this._femaleVoiceMap[localeLowerCase] || this._femaleVoiceMap["en-us"];
        }
        else {
            voiceName = this._maleVoiceMap[localeLowerCase] || this._maleVoiceMap["en-us"];
        }
        return voiceName;
    };
    return CognitiveServicesHelper;
}());


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(4);
var Exports_2 = __webpack_require__(0);
// Common.Storage.SetLocalStorage(new Common.Browser.LocalStorage());
// Common.Storage.SetSessionStorage(new Common.Browser.SessionStorage());
Exports_2.Events.Instance.AttachListener(new Exports_1.ConsoleLoggingListener());
__export(__webpack_require__(0));
__export(__webpack_require__(4));
__export(__webpack_require__(6));
__export(__webpack_require__(48));


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var ConsoleLoggingListener = (function () {
    function ConsoleLoggingListener(logLevelFilter) {
        if (logLevelFilter === void 0) { logLevelFilter = Exports_1.EventType.Warning; }
        var _this = this;
        this.OnEvent = function (event) {
            if (event.EventType >= _this.logLevelFilter) {
                var log = _this.ToString(event);
                switch (event.EventType) {
                    case Exports_1.EventType.Debug:
                        // tslint:disable-next-line:no-console
                        console.debug(log);
                        break;
                    case Exports_1.EventType.Info:
                        // tslint:disable-next-line:no-console
                        console.info(log);
                        break;
                    case Exports_1.EventType.Warning:
                        // tslint:disable-next-line:no-console
                        console.warn(log);
                        break;
                    case Exports_1.EventType.Error:
                        // tslint:disable-next-line:no-console
                        console.error(log);
                        break;
                    default:
                        // tslint:disable-next-line:no-console
                        console.log(log);
                        break;
                }
            }
        };
        this.ToString = function (event) {
            var logFragments = [
                "" + event.EventTime,
            ];
            if (event.constructor && event.constructor.name) {
                logFragments.push("" + event.constructor.name);
            }
            for (var prop in event) {
                if (prop && prop !== "EventTime" && prop !== "EventType" && prop !== "EventId" && prop !== "constructor") {
                    var value = event[prop];
                    var valueToLog = "<NULL>";
                    if (value !== undefined && value !== null) {
                        if (typeof (value) === "number" || typeof (value) === "string") {
                            valueToLog = value.toString();
                        }
                        else {
                            valueToLog = JSON.stringify(value);
                        }
                    }
                    logFragments.push(prop + ": " + valueToLog);
                }
            }
            return logFragments.join(" | ");
        };
        this.logLevelFilter = logLevelFilter;
    }
    return ConsoleLoggingListener;
}());
exports.ConsoleLoggingListener = ConsoleLoggingListener;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var LocalStorage = (function () {
    function LocalStorage() {
        this.Get = function (key) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            return localStorage.getItem(key);
        };
        this.GetOrAdd = function (key, valueToAdd) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            var value = localStorage.getItem(key);
            if (value === null || value === undefined) {
                localStorage.setItem(key, valueToAdd);
            }
            return localStorage.getItem(key);
        };
        this.Set = function (key, value) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            localStorage.setItem(key, value);
        };
        this.Remove = function (key) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            localStorage.removeItem(key);
        };
    }
    return LocalStorage;
}());
exports.LocalStorage = LocalStorage;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var MicAudioSource = (function () {
    function MicAudioSource(recorder, audioSourceId) {
        var _this = this;
        this.streams = {};
        this.TurnOn = function () {
            if (_this.initializeDeferral) {
                return _this.initializeDeferral.Promise();
            }
            _this.initializeDeferral = new Exports_1.Deferred();
            var nav = window.navigator;
            window.navigator.getUserMedia = (window.navigator.getUserMedia ||
                window.navigator.webkitGetUserMedia ||
                window.navigator.mozGetUserMedia ||
                window.navigator.msGetUserMedia);
            if (!window.navigator.getUserMedia) {
                var errorMsg = "Browser doesnot support getUserMedia.";
                _this.initializeDeferral.Reject(errorMsg);
                _this.OnEvent(new Exports_1.AudioSourceErrorEvent(errorMsg, "")); // mic initialized error - no streamid at this point
            }
            else {
                _this.OnEvent(new Exports_1.AudioSourceInitializingEvent(_this.id)); // no stream id
                window.navigator.getUserMedia({ audio: true }, function (mediaStream) {
                    _this.mediaStream = mediaStream;
                    _this.OnEvent(new Exports_1.AudioSourceReadyEvent(_this.id));
                    _this.initializeDeferral.Resolve(true);
                }, function (error) {
                    var errorMsg = "Error occured processing the user media stream. " + error;
                    _this.initializeDeferral.Reject(errorMsg);
                    _this.OnEvent(new Exports_1.AudioSourceErrorEvent(_this.id, errorMsg));
                });
            }
            return _this.initializeDeferral.Promise();
        };
        this.Id = function () {
            return _this.id;
        };
        this.Attach = function (audioNodeId) {
            _this.OnEvent(new Exports_1.AudioStreamNodeAttachingEvent(_this.id, audioNodeId));
            return _this.Listen(audioNodeId).OnSuccessContinueWith(function (streamReader) {
                _this.OnEvent(new Exports_1.AudioStreamNodeAttachedEvent(_this.id, audioNodeId));
                return {
                    Detach: function () {
                        streamReader.Close();
                        delete _this.streams[audioNodeId];
                        _this.OnEvent(new Exports_1.AudioStreamNodeDetachedEvent(_this.id, audioNodeId));
                        _this.TurnOff();
                    },
                    Id: function () {
                        return audioNodeId;
                    },
                    Read: function () {
                        return streamReader.Read();
                    },
                };
            });
        };
        this.Detach = function (audioNodeId) {
            if (audioNodeId && _this.streams[audioNodeId]) {
                _this.streams[audioNodeId].Close();
                delete _this.streams[audioNodeId];
                _this.OnEvent(new Exports_1.AudioStreamNodeDetachedEvent(_this.id, audioNodeId));
            }
        };
        this.TurnOff = function () {
            for (var streamId in _this.streams) {
                if (streamId) {
                    var stream = _this.streams[streamId];
                    if (stream) {
                        stream.Close();
                    }
                }
            }
            _this.recorder.ReleaseMediaResources();
            _this.OnEvent(new Exports_1.AudioSourceOffEvent(_this.id)); // no stream now
            _this.initializeDeferral = null;
            return Exports_1.PromiseHelper.FromResult(true);
        };
        this.Listen = function (audioNodeId) {
            return _this.TurnOn()
                .OnSuccessContinueWith(function (_) {
                var stream = new Exports_1.Stream(audioNodeId);
                _this.streams[audioNodeId] = stream;
                try {
                    _this.recorder.Record(_this.mediaStream, stream);
                }
                catch (error) {
                    var errorMsg = "Error occured processing the user media stream. " + error;
                    _this.initializeDeferral.Reject(errorMsg);
                    _this.OnEvent(new Exports_1.AudioStreamNodeErrorEvent(_this.id, audioNodeId, error));
                }
                return stream.GetReader();
            });
        };
        this.OnEvent = function (event) {
            _this.events.OnEvent(event);
            Exports_1.Events.Instance.OnEvent(event);
        };
        this.id = audioSourceId ? audioSourceId : Exports_1.CreateNoDashGuid();
        this.events = new Exports_1.EventSource();
        this.recorder = recorder;
    }
    Object.defineProperty(MicAudioSource.prototype, "Events", {
        get: function () {
            return this.events;
        },
        enumerable: true,
        configurable: true
    });
    return MicAudioSource;
}());
exports.MicAudioSource = MicAudioSource;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var OpusRecorder = (function () {
    function OpusRecorder(options) {
        var _this = this;
        this.Record = function (mediaStream, outputStream) {
            var mediaRecorder = new MediaRecorder(mediaStream, _this.mediaRecorderOptions);
            var timeslice = 100; // this is in ms - 100 ensures that the chunk doesn't exceed the max size of chunk allowed in WS connection
            mediaRecorder.ondataavailable = function (dataAvailableEvent) {
                if (outputStream) {
                    var reader_1 = new FileReader();
                    reader_1.readAsArrayBuffer(dataAvailableEvent.data);
                    reader_1.onloadend = function (event) {
                        outputStream.Write(reader_1.result);
                    };
                }
            };
            _this.mediaResources = {
                recorder: mediaRecorder,
                stream: mediaStream,
            };
            mediaRecorder.start(timeslice);
        };
        this.ReleaseMediaResources = function () {
            if (_this.mediaResources.recorder.state !== "inactive") {
                _this.mediaResources.recorder.stop();
            }
            _this.mediaResources.stream.getTracks().forEach(function (track) { return track.stop(); });
        };
        this.mediaRecorderOptions = options;
    }
    return OpusRecorder;
}());
exports.OpusRecorder = OpusRecorder;
/* Declaring this inline to avoid compiler warnings
declare class MediaRecorder {
    constructor(mediaStream: MediaStream, options: any);

    public state: string;

    public ondataavailable(dataAvailableEvent: any): void;
    public stop(): void;
}*/


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var PcmRecorder = (function () {
    function PcmRecorder() {
        var _this = this;
        this.Record = function (mediaStream, outputStream) {
            // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
            var audioContext = new AudioContext();
            // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
            var mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
            var desiredSampleRate = 16000;
            // let compressionRatio = mediaStreamSource.context.sampleRate / desiredSampleRate;
            var bufferSize = 2048;
            var isFirstFrameWritten = false;
            if (desiredSampleRate * 4 <= mediaStreamSource.context.sampleRate) {
                bufferSize = 8192;
            }
            else if (desiredSampleRate * 2 <= mediaStreamSource.context.sampleRate) {
                bufferSize = 4096;
            }
            // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
            var scriptNode = mediaStreamSource.context.createScriptProcessor(bufferSize, 1, 1);
            var waveStreamEncoder = new Exports_1.RiffPcmEncoder(mediaStreamSource.context.sampleRate, desiredSampleRate);
            scriptNode.onaudioprocess = function (audioProcessingEvent) {
                var monoAudioChunk = audioProcessingEvent.inputBuffer.getChannelData(0);
                var encodedAudioFrameWithRiffHeader;
                var encodedAudioFrame;
                if (outputStream) {
                    if (isFirstFrameWritten) {
                        if (!encodedAudioFrame) {
                            encodedAudioFrame = waveStreamEncoder.Encode(false, monoAudioChunk);
                        }
                        outputStream.Write(encodedAudioFrame);
                    }
                    else {
                        if (!encodedAudioFrameWithRiffHeader) {
                            encodedAudioFrameWithRiffHeader =
                                waveStreamEncoder.Encode(true, monoAudioChunk);
                        }
                        outputStream.Write(encodedAudioFrameWithRiffHeader);
                        isFirstFrameWritten = true;
                    }
                }
            };
            _this.mediaResources = {
                context: audioContext,
                scriptProcessorNode: scriptNode,
                source: mediaStreamSource,
                stream: mediaStream,
            };
            mediaStreamSource.connect(scriptNode);
            scriptNode.connect(mediaStreamSource.context.destination);
        };
        this.ReleaseMediaResources = function () {
            if (_this.mediaResources) {
                if (_this.mediaResources.scriptProcessorNode) {
                    _this.mediaResources.scriptProcessorNode.disconnect();
                    _this.mediaResources.scriptProcessorNode = null;
                }
                if (_this.mediaResources.source) {
                    _this.mediaResources.source.disconnect();
                    _this.mediaResources.stream.getTracks().forEach(function (track) { return track.stop(); });
                    _this.mediaResources.source = null;
                }
                if (_this.mediaResources.context && _this.mediaResources.context.state !== "closed") {
                    _this.mediaResources.context.close();
                }
            }
        };
    }
    return PcmRecorder;
}());
exports.PcmRecorder = PcmRecorder;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var SessionStorage = (function () {
    function SessionStorage() {
        this.Get = function (key) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            return sessionStorage.getItem(key);
        };
        this.GetOrAdd = function (key, valueToAdd) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            var value = sessionStorage.getItem(key);
            if (value === null || value === undefined) {
                sessionStorage.setItem(key, valueToAdd);
            }
            return sessionStorage.getItem(key);
        };
        this.Set = function (key, value) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            sessionStorage.setItem(key, value);
        };
        this.Remove = function (key) {
            if (!key) {
                throw new Exports_1.ArgumentNullError("key");
            }
            sessionStorage.removeItem(key);
        };
    }
    return SessionStorage;
}());
exports.SessionStorage = SessionStorage;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Timer = (function () {
    function Timer(delayInMillisec, successCallback) {
        var _this = this;
        this.start = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            if (_this.timerId) {
                _this.stop();
            }
            _this.timerId = setTimeout(_this.successCallback, _this.delayInMillisec, params);
        };
        this.stop = function () {
            clearTimeout(_this.timerId);
        };
        this.delayInMillisec = delayInMillisec;
        this.successCallback = successCallback;
    }
    return Timer;
}());
exports.Timer = Timer;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var WebsocketMessageAdapter_1 = __webpack_require__(9);
var WebsocketConnection = (function () {
    function WebsocketConnection(uri, queryParameters, headers, messageFormatter, connectionId) {
        var _this = this;
        this.isDisposed = false;
        this.Dispose = function () {
            _this.isDisposed = true;
            if (_this.connectionMessageAdapter) {
                _this.connectionMessageAdapter.Close();
            }
        };
        this.IsDisposed = function () {
            return _this.isDisposed;
        };
        this.State = function () {
            return _this.connectionMessageAdapter.State;
        };
        this.Open = function () {
            return _this.connectionMessageAdapter.Open();
        };
        this.Send = function (message) {
            return _this.connectionMessageAdapter.Send(message);
        };
        this.Read = function () {
            return _this.connectionMessageAdapter.Read();
        };
        if (!uri) {
            throw new Exports_1.ArgumentNullError("uri");
        }
        if (!messageFormatter) {
            throw new Exports_1.ArgumentNullError("messageFormatter");
        }
        this.messageFormatter = messageFormatter;
        var queryParams = "";
        var i = 0;
        if (queryParameters) {
            for (var paramName in queryParameters) {
                if (paramName) {
                    queryParams += i === 0 ? "?" : "&";
                    var val = encodeURIComponent(queryParameters[paramName]);
                    queryParams += paramName + "=" + val;
                    i++;
                }
            }
        }
        if (headers) {
            for (var headerName in headers) {
                if (headerName) {
                    queryParams += i === 0 ? "?" : "&";
                    var val = encodeURIComponent(headers[headerName]);
                    queryParams += headerName + "=" + val;
                    i++;
                }
            }
        }
        this.uri = uri + queryParams;
        this.id = connectionId ? connectionId : Exports_1.CreateNoDashGuid();
        this.connectionMessageAdapter = new WebsocketMessageAdapter_1.WebsocketMessageAdapter(this.uri, this.Id, this.messageFormatter);
    }
    Object.defineProperty(WebsocketConnection.prototype, "Id", {
        get: function () {
            return this.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebsocketConnection.prototype, "Events", {
        get: function () {
            return this.connectionMessageAdapter.Events;
        },
        enumerable: true,
        configurable: true
    });
    return WebsocketConnection;
}());
exports.WebsocketConnection = WebsocketConnection;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(3);
var PlatformEvent_1 = __webpack_require__(5);
var AudioSourceEvent = (function (_super) {
    tslib_1.__extends(AudioSourceEvent, _super);
    function AudioSourceEvent(audioSourceId, eventType) {
        if (eventType === void 0) { eventType = PlatformEvent_1.EventType.Info; }
        var _this = _super.call(this, eventType) || this;
        _this.audioSourceId = audioSourceId;
        return _this;
    }
    Object.defineProperty(AudioSourceEvent.prototype, "AudioSourceId", {
        get: function () {
            return this.audioSourceId;
        },
        enumerable: true,
        configurable: true
    });
    return AudioSourceEvent;
}(PlatformEvent_1.PlatformEvent));
exports.AudioSourceEvent = AudioSourceEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioSourceInitializingEvent = (function (_super) {
    tslib_1.__extends(AudioSourceInitializingEvent, _super);
    function AudioSourceInitializingEvent(audioSourceId) {
        return _super.call(this, audioSourceId) || this;
    }
    return AudioSourceInitializingEvent;
}(AudioSourceEvent));
exports.AudioSourceInitializingEvent = AudioSourceInitializingEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioSourceReadyEvent = (function (_super) {
    tslib_1.__extends(AudioSourceReadyEvent, _super);
    function AudioSourceReadyEvent(audioSourceId) {
        return _super.call(this, audioSourceId) || this;
    }
    return AudioSourceReadyEvent;
}(AudioSourceEvent));
exports.AudioSourceReadyEvent = AudioSourceReadyEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioSourceOffEvent = (function (_super) {
    tslib_1.__extends(AudioSourceOffEvent, _super);
    function AudioSourceOffEvent(audioSourceId) {
        return _super.call(this, audioSourceId) || this;
    }
    return AudioSourceOffEvent;
}(AudioSourceEvent));
exports.AudioSourceOffEvent = AudioSourceOffEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioSourceErrorEvent = (function (_super) {
    tslib_1.__extends(AudioSourceErrorEvent, _super);
    function AudioSourceErrorEvent(audioSourceId, error) {
        var _this = _super.call(this, audioSourceId, PlatformEvent_1.EventType.Error) || this;
        _this.error = error;
        return _this;
    }
    Object.defineProperty(AudioSourceErrorEvent.prototype, "Error", {
        get: function () {
            return this.error;
        },
        enumerable: true,
        configurable: true
    });
    return AudioSourceErrorEvent;
}(AudioSourceEvent));
exports.AudioSourceErrorEvent = AudioSourceErrorEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioStreamNodeEvent = (function (_super) {
    tslib_1.__extends(AudioStreamNodeEvent, _super);
    function AudioStreamNodeEvent(audioSourceId, audioNodeId) {
        var _this = _super.call(this, audioSourceId) || this;
        _this.audioNodeId = audioNodeId;
        return _this;
    }
    Object.defineProperty(AudioStreamNodeEvent.prototype, "AudioNodeId", {
        get: function () {
            return this.audioNodeId;
        },
        enumerable: true,
        configurable: true
    });
    return AudioStreamNodeEvent;
}(AudioSourceEvent));
exports.AudioStreamNodeEvent = AudioStreamNodeEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioStreamNodeAttachingEvent = (function (_super) {
    tslib_1.__extends(AudioStreamNodeAttachingEvent, _super);
    function AudioStreamNodeAttachingEvent(audioSourceId, audioNodeId) {
        return _super.call(this, audioSourceId, audioNodeId) || this;
    }
    return AudioStreamNodeAttachingEvent;
}(AudioStreamNodeEvent));
exports.AudioStreamNodeAttachingEvent = AudioStreamNodeAttachingEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioStreamNodeAttachedEvent = (function (_super) {
    tslib_1.__extends(AudioStreamNodeAttachedEvent, _super);
    function AudioStreamNodeAttachedEvent(audioSourceId, audioNodeId) {
        return _super.call(this, audioSourceId, audioNodeId) || this;
    }
    return AudioStreamNodeAttachedEvent;
}(AudioStreamNodeEvent));
exports.AudioStreamNodeAttachedEvent = AudioStreamNodeAttachedEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioStreamNodeDetachedEvent = (function (_super) {
    tslib_1.__extends(AudioStreamNodeDetachedEvent, _super);
    function AudioStreamNodeDetachedEvent(audioSourceId, audioNodeId) {
        return _super.call(this, audioSourceId, audioNodeId) || this;
    }
    return AudioStreamNodeDetachedEvent;
}(AudioStreamNodeEvent));
exports.AudioStreamNodeDetachedEvent = AudioStreamNodeDetachedEvent;
// tslint:disable-next-line:max-classes-per-file
var AudioStreamNodeErrorEvent = (function (_super) {
    tslib_1.__extends(AudioStreamNodeErrorEvent, _super);
    function AudioStreamNodeErrorEvent(audioSourceId, audioNodeId, error) {
        var _this = _super.call(this, audioSourceId, audioNodeId) || this;
        _this.error = error;
        return _this;
    }
    Object.defineProperty(AudioStreamNodeErrorEvent.prototype, "Error", {
        get: function () {
            return this.error;
        },
        enumerable: true,
        configurable: true
    });
    return AudioStreamNodeErrorEvent;
}(AudioStreamNodeEvent));
exports.AudioStreamNodeErrorEvent = AudioStreamNodeErrorEvent;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(3);
var PlatformEvent_1 = __webpack_require__(5);
var ConnectionEvent = (function (_super) {
    tslib_1.__extends(ConnectionEvent, _super);
    function ConnectionEvent(connectionId, eventType) {
        if (eventType === void 0) { eventType = PlatformEvent_1.EventType.Info; }
        var _this = _super.call(this, eventType) || this;
        _this.connectionId = connectionId;
        return _this;
    }
    Object.defineProperty(ConnectionEvent.prototype, "ConnectionId", {
        get: function () {
            return this.connectionId;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionEvent;
}(PlatformEvent_1.PlatformEvent));
exports.ConnectionEvent = ConnectionEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectionStartEvent = (function (_super) {
    tslib_1.__extends(ConnectionStartEvent, _super);
    function ConnectionStartEvent(connectionId, uri, headers) {
        var _this = _super.call(this, connectionId) || this;
        _this.uri = uri;
        _this.headers = headers;
        return _this;
    }
    Object.defineProperty(ConnectionStartEvent.prototype, "Uri", {
        get: function () {
            return this.uri;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionStartEvent.prototype, "Headers", {
        get: function () {
            return this.headers;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionStartEvent;
}(ConnectionEvent));
exports.ConnectionStartEvent = ConnectionStartEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectionEstablishedEvent = (function (_super) {
    tslib_1.__extends(ConnectionEstablishedEvent, _super);
    function ConnectionEstablishedEvent(connectionId, metadata) {
        return _super.call(this, connectionId) || this;
    }
    return ConnectionEstablishedEvent;
}(ConnectionEvent));
exports.ConnectionEstablishedEvent = ConnectionEstablishedEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectionClosedEvent = (function (_super) {
    tslib_1.__extends(ConnectionClosedEvent, _super);
    function ConnectionClosedEvent(connectionId, statusCode, reason) {
        var _this = _super.call(this, connectionId, PlatformEvent_1.EventType.Warning) || this;
        _this.reason = reason;
        _this.statusCode = statusCode;
        return _this;
    }
    Object.defineProperty(ConnectionClosedEvent.prototype, "Reason", {
        get: function () {
            return this.reason;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionClosedEvent.prototype, "StatusCode", {
        get: function () {
            return this.statusCode;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionClosedEvent;
}(ConnectionEvent));
exports.ConnectionClosedEvent = ConnectionClosedEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectionEstablishErrorEvent = (function (_super) {
    tslib_1.__extends(ConnectionEstablishErrorEvent, _super);
    function ConnectionEstablishErrorEvent(connectionId, statuscode, reason) {
        var _this = _super.call(this, connectionId, PlatformEvent_1.EventType.Error) || this;
        _this.statusCode = statuscode;
        _this.reason = reason;
        return _this;
    }
    Object.defineProperty(ConnectionEstablishErrorEvent.prototype, "Reason", {
        get: function () {
            return this.reason;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionEstablishErrorEvent.prototype, "StatusCode", {
        get: function () {
            return this.statusCode;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionEstablishErrorEvent;
}(ConnectionEvent));
exports.ConnectionEstablishErrorEvent = ConnectionEstablishErrorEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectionMessageReceivedEvent = (function (_super) {
    tslib_1.__extends(ConnectionMessageReceivedEvent, _super);
    function ConnectionMessageReceivedEvent(connectionId, networkReceivedTimeISO, message) {
        var _this = _super.call(this, connectionId) || this;
        _this.networkReceivedTime = networkReceivedTimeISO;
        _this.message = message;
        return _this;
    }
    Object.defineProperty(ConnectionMessageReceivedEvent.prototype, "NetworkReceivedTime", {
        get: function () {
            return this.networkReceivedTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessageReceivedEvent.prototype, "Message", {
        get: function () {
            return this.message;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionMessageReceivedEvent;
}(ConnectionEvent));
exports.ConnectionMessageReceivedEvent = ConnectionMessageReceivedEvent;
// tslint:disable-next-line:max-classes-per-file
var ConnectionMessageSentEvent = (function (_super) {
    tslib_1.__extends(ConnectionMessageSentEvent, _super);
    function ConnectionMessageSentEvent(connectionId, networkSentTimeISO, message) {
        var _this = _super.call(this, connectionId) || this;
        _this.networkSentTime = networkSentTimeISO;
        _this.message = message;
        return _this;
    }
    Object.defineProperty(ConnectionMessageSentEvent.prototype, "NetworkSentTime", {
        get: function () {
            return this.networkSentTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionMessageSentEvent.prototype, "Message", {
        get: function () {
            return this.message;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionMessageSentEvent;
}(ConnectionEvent));
exports.ConnectionMessageSentEvent = ConnectionMessageSentEvent;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionOpenResponse = (function () {
    function ConnectionOpenResponse(statusCode, reason) {
        this.statusCode = statusCode;
        this.reason = reason;
    }
    Object.defineProperty(ConnectionOpenResponse.prototype, "StatusCode", {
        get: function () {
            return this.statusCode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionOpenResponse.prototype, "Reason", {
        get: function () {
            return this.reason;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionOpenResponse;
}());
exports.ConnectionOpenResponse = ConnectionOpenResponse;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var EventSource_1 = __webpack_require__(11);
var Events = (function () {
    function Events() {
    }
    Object.defineProperty(Events, "Instance", {
        get: function () {
            return Events.instance;
        },
        enumerable: true,
        configurable: true
    });
    return Events;
}());
Events.instance = new EventSource_1.EventSource();
Events.SetEventSource = function (eventSource) {
    if (!eventSource) {
        throw new Error_1.ArgumentNullError("eventSource");
    }
    Events.instance = eventSource;
};
exports.Events = Events;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["None"] = 0] = "None";
    ConnectionState[ConnectionState["Connected"] = 1] = "Connected";
    ConnectionState[ConnectionState["Connecting"] = 2] = "Connecting";
    ConnectionState[ConnectionState["Disconnected"] = 3] = "Disconnected";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionMessage_1 = __webpack_require__(10);
var Error_1 = __webpack_require__(1);
var Guid_1 = __webpack_require__(2);
var RawWebsocketMessage = (function () {
    function RawWebsocketMessage(messageType, payload, id) {
        this.payload = null;
        if (!payload) {
            throw new Error_1.ArgumentNullError("payload");
        }
        if (messageType === ConnectionMessage_1.MessageType.Binary && !(payload instanceof ArrayBuffer)) {
            throw new Error_1.InvalidOperationError("Payload must be ArrayBuffer");
        }
        if (messageType === ConnectionMessage_1.MessageType.Text && !(typeof (payload) === "string")) {
            throw new Error_1.InvalidOperationError("Payload must be a string");
        }
        this.messageType = messageType;
        this.payload = payload;
        this.id = id ? id : Guid_1.CreateNoDashGuid();
    }
    Object.defineProperty(RawWebsocketMessage.prototype, "MessageType", {
        get: function () {
            return this.messageType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawWebsocketMessage.prototype, "Payload", {
        get: function () {
            return this.payload;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawWebsocketMessage.prototype, "TextContent", {
        get: function () {
            if (this.messageType === ConnectionMessage_1.MessageType.Binary) {
                throw new Error_1.InvalidOperationError("Not supported for binary message");
            }
            return this.payload;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawWebsocketMessage.prototype, "BinaryContent", {
        get: function () {
            if (this.messageType === ConnectionMessage_1.MessageType.Text) {
                throw new Error_1.InvalidOperationError("Not supported for text message");
            }
            return this.payload;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawWebsocketMessage.prototype, "Id", {
        get: function () {
            return this.id;
        },
        enumerable: true,
        configurable: true
    });
    return RawWebsocketMessage;
}());
exports.RawWebsocketMessage = RawWebsocketMessage;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var RiffPcmEncoder = (function () {
    function RiffPcmEncoder(actualSampleRate, desiredSampleRate) {
        var _this = this;
        this.channelCount = 1;
        this.Encode = function (isFirstAudioFrame, actualAudioFrame) {
            var audioFrame = _this.DownSampleAudioFrame(actualAudioFrame, _this.actualSampleRate, _this.desiredSampleRate);
            var audioLength = audioFrame.length * 2;
            if (!isFirstAudioFrame) {
                var buffer_1 = new ArrayBuffer(audioLength);
                var view_1 = new DataView(buffer_1);
                _this.FloatTo16BitPCM(view_1, 0, audioFrame);
                return buffer_1;
            }
            var buffer = new ArrayBuffer(44 + audioLength);
            var bitsPerSample = 16;
            var bytesPerSample = bitsPerSample / 8;
            // We dont know ahead of time about the length of audio to stream. So set to 0.
            var fileLength = 0;
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
            var view = new DataView(buffer);
            /* RIFF identifier */
            _this.SetString(view, 0, "RIFF");
            /* file length */
            view.setUint32(4, fileLength, true);
            /* RIFF type & Format */
            _this.SetString(view, 8, "WAVEfmt ");
            /* format chunk length */
            view.setUint32(16, 16, true);
            /* sample format (raw) */
            view.setUint16(20, 1, true);
            /* channel count */
            view.setUint16(22, _this.channelCount, true);
            /* sample rate */
            view.setUint32(24, _this.desiredSampleRate, true);
            /* byte rate (sample rate * block align) */
            view.setUint32(28, _this.desiredSampleRate * _this.channelCount * bytesPerSample, true);
            /* block align (channel count * bytes per sample) */
            view.setUint16(32, _this.channelCount * bytesPerSample, true);
            /* bits per sample */
            view.setUint16(34, bitsPerSample, true);
            /* data chunk identifier */
            _this.SetString(view, 36, "data");
            /* data chunk length */
            view.setUint32(40, fileLength, true);
            _this.FloatTo16BitPCM(view, 44, audioFrame);
            return buffer;
        };
        this.SetString = function (view, offset, str) {
            for (var i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };
        this.FloatTo16BitPCM = function (view, offset, input) {
            for (var i = 0; i < input.length; i++, offset += 2) {
                var s = Math.max(-1, Math.min(1, input[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };
        this.DownSampleAudioFrame = function (audioFrame, actualSampleRate, desiredSamplerate) {
            if (desiredSamplerate === actualSampleRate || desiredSamplerate > actualSampleRate) {
                return audioFrame;
            }
            var sampleRateRatio = actualSampleRate / desiredSamplerate;
            var newLength = Math.round(audioFrame.length / sampleRateRatio);
            var downSampledAudioFrame = new Float32Array(newLength);
            var offsetResult = 0;
            var offsetBuffer = 0;
            while (offsetResult < downSampledAudioFrame.length) {
                var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
                var accum = 0;
                var count = 0;
                for (var i = offsetBuffer; i < nextOffsetBuffer && i < audioFrame.length; i++) {
                    accum += audioFrame[i];
                    count++;
                }
                downSampledAudioFrame[offsetResult] = accum / count;
                offsetResult++;
                offsetBuffer = nextOffsetBuffer;
            }
            return downSampledAudioFrame;
        };
        this.actualSampleRate = actualSampleRate;
        this.desiredSampleRate = desiredSampleRate;
    }
    return RiffPcmEncoder;
}());
exports.RiffPcmEncoder = RiffPcmEncoder;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var InMemoryStorage_1 = __webpack_require__(12);
var Storage = (function () {
    function Storage() {
    }
    Object.defineProperty(Storage, "Session", {
        get: function () {
            return Storage.sessionStorage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Storage, "Local", {
        get: function () {
            return Storage.localStorage;
        },
        enumerable: true,
        configurable: true
    });
    return Storage;
}());
Storage.sessionStorage = new InMemoryStorage_1.InMemoryStorage();
Storage.localStorage = new InMemoryStorage_1.InMemoryStorage();
Storage.SetSessionStorage = function (sessionStorage) {
    if (!sessionStorage) {
        throw new Error_1.ArgumentNullError("sessionStorage");
    }
    Storage.sessionStorage = sessionStorage;
};
Storage.SetLocalStorage = function (localStorage) {
    if (!localStorage) {
        throw new Error_1.ArgumentNullError("localStorage");
    }
    Storage.localStorage = localStorage;
};
exports.Storage = Storage;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Error_1 = __webpack_require__(1);
var Guid_1 = __webpack_require__(2);
var Queue_1 = __webpack_require__(15);
var Stream = (function () {
    function Stream(streamId) {
        var _this = this;
        this.readerIdCounter = 1;
        this.isEnded = false;
        this.Write = function (buffer) {
            _this.ThrowIfClosed();
            _this.WriteStreamChunk({
                Buffer: buffer,
                IsEnd: false,
            });
        };
        this.GetReader = function () {
            var readerId = _this.readerIdCounter;
            _this.readerIdCounter++;
            var readerQueue = new Queue_1.Queue();
            var currentLength = _this.streambuffer.length;
            _this.readerQueues[readerId] = readerQueue;
            for (var i = 0; i < currentLength; i++) {
                readerQueue.Enqueue(_this.streambuffer[i]);
            }
            return new StreamReader(_this.id, readerQueue, function () {
                delete _this.readerQueues[readerId];
            });
        };
        this.Close = function () {
            if (!_this.isEnded) {
                _this.WriteStreamChunk({
                    Buffer: null,
                    IsEnd: true,
                });
                _this.isEnded = true;
            }
        };
        this.WriteStreamChunk = function (streamChunk) {
            _this.ThrowIfClosed();
            _this.streambuffer.push(streamChunk);
            for (var readerId in _this.readerQueues) {
                if (!_this.readerQueues[readerId].IsDisposed()) {
                    try {
                        _this.readerQueues[readerId].Enqueue(streamChunk);
                    }
                    catch (e) {
                        // Do nothing
                    }
                }
            }
        };
        this.ThrowIfClosed = function () {
            if (_this.isEnded) {
                throw new Error_1.InvalidOperationError("Stream closed");
            }
        };
        this.id = streamId ? streamId : Guid_1.CreateNoDashGuid();
        this.streambuffer = [];
        this.readerQueues = {};
    }
    Object.defineProperty(Stream.prototype, "IsClosed", {
        get: function () {
            return this.isEnded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stream.prototype, "Id", {
        get: function () {
            return this.id;
        },
        enumerable: true,
        configurable: true
    });
    return Stream;
}());
exports.Stream = Stream;
// tslint:disable-next-line:max-classes-per-file
var StreamReader = (function () {
    function StreamReader(streamId, readerQueue, onClose) {
        var _this = this;
        this.isClosed = false;
        this.Read = function () {
            if (_this.IsClosed) {
                throw new Error_1.InvalidOperationError("StreamReader closed");
            }
            return _this.readerQueue
                .Dequeue()
                .OnSuccessContinueWith(function (streamChunk) {
                if (streamChunk.IsEnd) {
                    _this.readerQueue.Dispose("End of stream reached");
                }
                return streamChunk;
            });
        };
        this.Close = function () {
            if (!_this.isClosed) {
                _this.isClosed = true;
                _this.readerQueue.Dispose("StreamReader closed");
                _this.onClose();
            }
        };
        this.readerQueue = readerQueue;
        this.onClose = onClose;
        this.streamId = streamId;
    }
    Object.defineProperty(StreamReader.prototype, "IsClosed", {
        get: function () {
            return this.isClosed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StreamReader.prototype, "StreamId", {
        get: function () {
            return this.streamId;
        },
        enumerable: true,
        configurable: true
    });
    return StreamReader;
}());
exports.StreamReader = StreamReader;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(49));
__export(__webpack_require__(16));


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(4);
var Exports_2 = __webpack_require__(6);
var SpeechConnectionFactory_1 = __webpack_require__(16);
var CreateRecognizer = function (recognizerConfig, authentication) {
    return CreateRecognizerWithPcmRecorder(recognizerConfig, authentication);
};
exports.CreateRecognizer = CreateRecognizer;
var CreateRecognizerWithPcmRecorder = function (recognizerConfig, authentication) {
    return CreateRecognizerWithCustomAudioSource(recognizerConfig, authentication, new Exports_1.MicAudioSource(new Exports_1.PcmRecorder()));
};
exports.CreateRecognizerWithPcmRecorder = CreateRecognizerWithPcmRecorder;
var CreateRecognizerWithCustomAudioSource = function (recognizerConfig, authentication, audioSource) {
    return new Exports_2.Recognizer(authentication, new SpeechConnectionFactory_1.SpeechConnectionFactory(), audioSource, recognizerConfig);
};
exports.CreateRecognizerWithCustomAudioSource = CreateRecognizerWithCustomAudioSource;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var IAuthentication_1 = __webpack_require__(7);
var AuthHeader = "Ocp-Apim-Subscription-Key";
var CognitiveSubscriptionKeyAuthentication = (function () {
    function CognitiveSubscriptionKeyAuthentication(subscriptionKey) {
        var _this = this;
        this.Fetch = function (authFetchEventId) {
            return Exports_1.PromiseHelper.FromResult(_this.authInfo);
        };
        this.FetchOnExpiry = function (authFetchEventId) {
            return Exports_1.PromiseHelper.FromResult(_this.authInfo);
        };
        if (!subscriptionKey) {
            throw new Exports_1.ArgumentNullError("subscriptionKey");
        }
        this.authInfo = new IAuthentication_1.AuthInfo(AuthHeader, subscriptionKey);
    }
    return CognitiveSubscriptionKeyAuthentication;
}());
exports.CognitiveSubscriptionKeyAuthentication = CognitiveSubscriptionKeyAuthentication;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var IAuthentication_1 = __webpack_require__(7);
var AuthHeader = "Authorization";
var CognitiveTokenAuthentication = (function () {
    function CognitiveTokenAuthentication(fetchCallback, fetchOnExpiryCallback) {
        var _this = this;
        this.Fetch = function (authFetchEventId) {
            return _this.fetchCallback(authFetchEventId).OnSuccessContinueWith(function (token) { return new IAuthentication_1.AuthInfo(AuthHeader, token); });
        };
        this.FetchOnExpiry = function (authFetchEventId) {
            return _this.fetchOnExpiryCallback(authFetchEventId).OnSuccessContinueWith(function (token) { return new IAuthentication_1.AuthInfo(AuthHeader, token); });
        };
        if (!fetchCallback) {
            throw new Exports_1.ArgumentNullError("fetchCallback");
        }
        if (!fetchOnExpiryCallback) {
            throw new Exports_1.ArgumentNullError("fetchOnExpiryCallback");
        }
        this.fetchCallback = fetchCallback;
        this.fetchOnExpiryCallback = fetchOnExpiryCallback;
    }
    return CognitiveTokenAuthentication;
}());
exports.CognitiveTokenAuthentication = CognitiveTokenAuthentication;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var RecognitionEvents_1 = __webpack_require__(8);
var RecognizerConfig_1 = __webpack_require__(17);
var ServiceTelemetryListener_Internal_1 = __webpack_require__(54);
var SpeechConnectionMessage_Internal_1 = __webpack_require__(55);
var Recognizer = (function () {
    function Recognizer(authentication, connectionFactory, audioSource, recognizerConfig) {
        var _this = this;
        this.Recognize = function (onEventCallback, speechContextJson) {
            var requestSession = new RequestSession(_this.audioSource.Id(), onEventCallback);
            requestSession.ListenForServiceTelemetry(_this.audioSource.Events);
            return _this.audioSource
                .Attach(requestSession.AudioNodeId)
                .ContinueWithPromise(function (result) {
                if (result.IsError) {
                    requestSession.OnAudioSourceAttachCompleted(null, true, result.Error);
                    throw new Error(result.Error);
                }
                else {
                    requestSession.OnAudioSourceAttachCompleted(result.Result, false);
                }
                var audioNode = result.Result;
                _this.FetchConnection(requestSession)
                    .OnSuccessContinueWith(function (connection) {
                    var messageRetrievalPromise = _this.ReceiveMessage(connection, requestSession);
                    var messageSendPromise = _this.SendSpeechConfig(requestSession.RequestId, connection, _this.recognizerConfig.SpeechConfig.Serialize())
                        .OnSuccessContinueWithPromise(function (_) {
                        return _this.SendSpeechContext(requestSession.RequestId, connection, speechContextJson)
                            .OnSuccessContinueWithPromise(function (_) {
                            return _this.SendAudio(requestSession.RequestId, connection, audioNode, requestSession);
                        });
                    });
                    var completionPromise = Exports_1.PromiseHelper.WhenAll([messageRetrievalPromise, messageSendPromise]);
                    completionPromise.On(function (r) {
                        requestSession.Dispose();
                        _this.SendTelemetryData(requestSession.RequestId, connection, requestSession.GetTelemetry());
                    }, function (error) {
                        requestSession.Dispose(error);
                        _this.SendTelemetryData(requestSession.RequestId, connection, requestSession.GetTelemetry());
                    });
                    return completionPromise;
                });
                return requestSession.CompletionPromise;
            });
        };
        this.FetchConnection = function (requestSession, isUnAuthorized) {
            if (isUnAuthorized === void 0) { isUnAuthorized = false; }
            if (_this.connectionFetchPromise) {
                if (_this.connectionFetchPromise.Result().IsError
                    || _this.connectionFetchPromise.Result().Result.State() === Exports_1.ConnectionState.Disconnected) {
                    _this.connectionId = null;
                    _this.connectionFetchPromise = null;
                    return _this.FetchConnection(requestSession);
                }
                else {
                    requestSession.OnPreConnectionStart(_this.authFetchEventId, _this.connectionId);
                    requestSession.OnConnectionEstablishCompleted(200);
                    requestSession.ListenForServiceTelemetry(_this.connectionFetchPromise.Result().Result.Events);
                    return _this.connectionFetchPromise;
                }
            }
            _this.authFetchEventId = Exports_1.CreateNoDashGuid();
            _this.connectionId = Exports_1.CreateNoDashGuid();
            requestSession.OnPreConnectionStart(_this.authFetchEventId, _this.connectionId);
            var authPromise = isUnAuthorized ? _this.authentication.FetchOnExpiry(_this.authFetchEventId) : _this.authentication.Fetch(_this.authFetchEventId);
            _this.connectionFetchPromise = authPromise
                .ContinueWithPromise(function (result) {
                if (result.IsError) {
                    requestSession.OnAuthCompleted(true, result.Error);
                    throw new Error(result.Error);
                }
                else {
                    requestSession.OnAuthCompleted(false);
                }
                var connection = _this.connectionFactory.Create(_this.recognizerConfig, result.Result, _this.connectionId);
                requestSession.ListenForServiceTelemetry(connection.Events);
                return connection.Open().OnSuccessContinueWithPromise(function (response) {
                    if (response.StatusCode === 200) {
                        requestSession.OnConnectionEstablishCompleted(response.StatusCode);
                        return Exports_1.PromiseHelper.FromResult(connection);
                    }
                    else if (response.StatusCode === 403 && !isUnAuthorized) {
                        return _this.FetchConnection(requestSession, true);
                    }
                    else {
                        requestSession.OnConnectionEstablishCompleted(response.StatusCode, response.Reason);
                        return Exports_1.PromiseHelper.FromError("Unable to contact server. StatusCode: " + response.StatusCode + ", Reason: " + response.Reason);
                    }
                });
            });
            return _this.connectionFetchPromise;
        };
        this.ReceiveMessage = function (connection, requestSession) {
            return connection
                .Read()
                .OnSuccessContinueWithPromise(function (message) {
                var connectionMessage = SpeechConnectionMessage_Internal_1.SpeechConnectionMessage.FromConnectionMessage(message);
                if (connectionMessage.RequestId.toLowerCase() === requestSession.RequestId.toLowerCase()) {
                    switch (connectionMessage.Path.toLowerCase()) {
                        case "turn.start":
                            requestSession.OnServiceTurnStartResponse(JSON.parse(connectionMessage.TextBody));
                            break;
                        case "speech.startDetected":
                            requestSession.OnServiceSpeechStartDetectedResponse(JSON.parse(connectionMessage.TextBody));
                            break;
                        case "speech.hypothesis":
                            requestSession.OnServiceSpeechHypothesisResponse(JSON.parse(connectionMessage.TextBody));
                            break;
                        case "speech.enddetected":
                            requestSession.OnServiceSpeechEndDetectedResponse(JSON.parse(connectionMessage.TextBody));
                            break;
                        case "speech.phrase":
                            if (_this.recognizerConfig.IsContinuousRecognition) {
                                // For continuous recognition telemetry has to be sent for every phrase as per spec.
                                _this.SendTelemetryData(requestSession.RequestId, connection, requestSession.GetTelemetry());
                            }
                            if (_this.recognizerConfig.Format === RecognizerConfig_1.SpeechResultFormat.Simple) {
                                requestSession.OnServiceSimpleSpeechPhraseResponse(JSON.parse(connectionMessage.TextBody));
                            }
                            else {
                                requestSession.OnServiceDetailedSpeechPhraseResponse(JSON.parse(connectionMessage.TextBody));
                            }
                            break;
                        case "turn.end":
                            requestSession.OnServiceTurnEndResponse();
                            return Exports_1.PromiseHelper.FromResult(true);
                        default:
                            break;
                    }
                }
                return _this.ReceiveMessage(connection, requestSession);
            });
        };
        this.SendSpeechConfig = function (requestId, connection, speechConfigJson) {
            if (speechConfigJson && _this.connectionId !== _this.speechConfigConnectionId) {
                _this.speechConfigConnectionId = _this.connectionId;
                return connection
                    .Send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_1.MessageType.Text, "speech.config", requestId, "application/json", speechConfigJson));
            }
            return Exports_1.PromiseHelper.FromResult(true);
        };
        this.SendSpeechContext = function (requestId, connection, speechContextJson) {
            if (speechContextJson) {
                return connection
                    .Send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_1.MessageType.Text, "speech.context", requestId, "application/json", speechContextJson));
            }
            return Exports_1.PromiseHelper.FromResult(true);
        };
        this.SendTelemetryData = function (requestId, connection, telemetryData) {
            return connection
                .Send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_1.MessageType.Text, "telemetry", requestId, "application/json", telemetryData));
        };
        this.SendAudio = function (requestId, connection, audioStreamNode, requestSession) {
            return audioStreamNode
                .Read()
                .OnSuccessContinueWithPromise(function (audioStreamChunk) {
                if (requestSession.IsSpeechEnded) {
                    // If service already recognized audio end then dont send any more audio
                    return Exports_1.PromiseHelper.FromResult(true);
                }
                else if (audioStreamChunk.IsEnd) {
                    return connection
                        .Send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_1.MessageType.Binary, "audio", requestId, null, null));
                }
                else {
                    return connection
                        .Send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_1.MessageType.Binary, "audio", requestId, null, audioStreamChunk.Buffer))
                        .OnSuccessContinueWithPromise(function (_) {
                        return _this.SendAudio(requestId, connection, audioStreamNode, requestSession);
                    });
                }
            });
        };
        if (!authentication) {
            throw new Exports_1.ArgumentNullError("authentication");
        }
        if (!connectionFactory) {
            throw new Exports_1.ArgumentNullError("connectionFactory");
        }
        if (!audioSource) {
            throw new Exports_1.ArgumentNullError("audioSource");
        }
        if (!recognizerConfig) {
            throw new Exports_1.ArgumentNullError("recognizerConfig");
        }
        this.authentication = authentication;
        this.connectionFactory = connectionFactory;
        this.audioSource = audioSource;
        this.recognizerConfig = recognizerConfig;
    }
    Object.defineProperty(Recognizer.prototype, "AudioSource", {
        get: function () {
            return this.audioSource;
        },
        enumerable: true,
        configurable: true
    });
    return Recognizer;
}());
exports.Recognizer = Recognizer;
// tslint:disable-next-line:max-classes-per-file
var RequestSession = (function () {
    function RequestSession(audioSourceId, onEventCallback) {
        var _this = this;
        this.isDisposed = false;
        this.detachables = new Array();
        this.isAudioNodeDetached = false;
        this.isCompleted = false;
        this.OnAudioSourceAttachCompleted = function (audioNode, isError, error) {
            _this.audioNode = audioNode;
            if (isError) {
                _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.AudioSourceError, error);
            }
            else {
                _this.OnEvent(new RecognitionEvents_1.ListeningStartedEvent(_this.requestId, _this.audioSourceId, _this.audioNodeId));
            }
        };
        this.OnPreConnectionStart = function (authFetchEventId, connectionId) {
            _this.authFetchEventId = authFetchEventId;
            _this.connectionId = connectionId;
            _this.OnEvent(new RecognitionEvents_1.ConnectingToServiceEvent(_this.requestId, _this.authFetchEventId, _this.connectionId));
        };
        this.OnAuthCompleted = function (isError, error) {
            if (isError) {
                _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.AuthTokenFetchError, error);
            }
        };
        this.OnConnectionEstablishCompleted = function (statusCode, reason) {
            if (statusCode === 200) {
                _this.OnEvent(new RecognitionEvents_1.RecognitionStartedEvent(_this.RequestId, _this.audioSourceId, _this.audioNodeId, _this.authFetchEventId, _this.connectionId));
                return;
            }
            else if (statusCode === 403) {
                _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.UnAuthorized, reason);
            }
            else {
                _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.ConnectError, reason);
            }
        };
        this.OnServiceTurnStartResponse = function (response) {
            if (response && response.context && response.context.serviceTag) {
                _this.serviceTag = response.context.serviceTag;
            }
        };
        this.OnServiceSpeechStartDetectedResponse = function (result) {
            _this.OnEvent(new RecognitionEvents_1.SpeechStartDetectedEvent(_this.RequestId, result));
        };
        this.OnServiceSpeechHypothesisResponse = function (result) {
            _this.OnEvent(new RecognitionEvents_1.SpeechHypothesisEvent(_this.RequestId, result));
        };
        this.OnServiceSpeechEndDetectedResponse = function (result) {
            _this.DetachAudioNode();
            _this.OnEvent(new RecognitionEvents_1.SpeechEndDetectedEvent(_this.RequestId, result));
        };
        this.OnServiceSimpleSpeechPhraseResponse = function (result) {
            _this.OnEvent(new RecognitionEvents_1.SpeechSimplePhraseEvent(_this.RequestId, result));
        };
        this.OnServiceDetailedSpeechPhraseResponse = function (result) {
            _this.OnEvent(new RecognitionEvents_1.SpeechDetailedPhraseEvent(_this.RequestId, result));
        };
        this.OnServiceTurnEndResponse = function () {
            _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.Success);
        };
        this.OnConnectionError = function (error) {
            _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.UnknownError, error);
        };
        this.Dispose = function (error) {
            if (!_this.isDisposed) {
                // we should have completed by now. If we did not its an unknown error.
                _this.OnComplete(RecognitionEvents_1.RecognitionCompletionStatus.UnknownError, error);
                _this.isDisposed = true;
                for (var _i = 0, _a = _this.detachables; _i < _a.length; _i++) {
                    var detachable = _a[_i];
                    detachable.Detach();
                }
                _this.serviceTelemetryListener.Dispose();
            }
        };
        this.GetTelemetry = function () {
            return _this.serviceTelemetryListener.GetTelemetry();
        };
        this.OnComplete = function (status, error) {
            if (!_this.isCompleted) {
                _this.isCompleted = true;
                _this.DetachAudioNode();
                _this.OnEvent(new RecognitionEvents_1.RecognitionEndedEvent(_this.RequestId, _this.audioSourceId, _this.audioNodeId, _this.authFetchEventId, _this.connectionId, _this.serviceTag, status, error ? error : ""));
            }
        };
        this.DetachAudioNode = function () {
            if (!_this.isAudioNodeDetached) {
                _this.isAudioNodeDetached = true;
                if (_this.audioNode) {
                    _this.audioNode.Detach();
                }
            }
        };
        this.OnEvent = function (event) {
            _this.serviceTelemetryListener.OnEvent(event);
            Exports_1.Events.Instance.OnEvent(event);
            if (_this.onEventCallback) {
                _this.onEventCallback(event);
            }
        };
        this.audioSourceId = audioSourceId;
        this.onEventCallback = onEventCallback;
        this.requestId = Exports_1.CreateNoDashGuid();
        this.audioNodeId = Exports_1.CreateNoDashGuid();
        this.requestCompletionDeferral = new Exports_1.Deferred();
        this.serviceTelemetryListener = new ServiceTelemetryListener_Internal_1.ServiceTelemetryListener(this.requestId, this.audioSourceId, this.audioNodeId);
        this.OnEvent(new RecognitionEvents_1.RecognitionTriggeredEvent(this.RequestId, this.audioSourceId, this.audioNodeId));
    }
    Object.defineProperty(RequestSession.prototype, "RequestId", {
        get: function () {
            return this.requestId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestSession.prototype, "AudioNodeId", {
        get: function () {
            return this.audioNodeId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestSession.prototype, "CompletionPromise", {
        get: function () {
            return this.requestCompletionDeferral.Promise();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestSession.prototype, "IsSpeechEnded", {
        get: function () {
            return this.isAudioNodeDetached;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestSession.prototype, "IsCompleted", {
        get: function () {
            return this.isCompleted;
        },
        enumerable: true,
        configurable: true
    });
    RequestSession.prototype.ListenForServiceTelemetry = function (eventSource) {
        this.detachables.push(eventSource.AttachListener(this.serviceTelemetryListener));
    };
    return RequestSession;
}());


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var RecognitionEvents_1 = __webpack_require__(8);
// tslint:disable-next-line:max-classes-per-file
var ServiceTelemetryListener = (function () {
    function ServiceTelemetryListener(requestId, audioSourceId, audioNodeId) {
        var _this = this;
        this.isDisposed = false;
        this.listeningTriggerMetric = null;
        this.micMetric = null;
        this.connectionEstablishMetric = null;
        this.OnEvent = function (e) {
            if (_this.isDisposed) {
                return;
            }
            if (e instanceof RecognitionEvents_1.RecognitionTriggeredEvent && e.RequestId === _this.requestId) {
                _this.listeningTriggerMetric = {
                    End: e.EventTime,
                    Name: "ListeningTrigger",
                    Start: e.EventTime,
                };
            }
            if (e instanceof Exports_1.AudioStreamNodeAttachingEvent && e.AudioSourceId === _this.audioSourceId && e.AudioNodeId === _this.audioNodeId) {
                _this.micStartTime = e.EventTime;
            }
            if (e instanceof Exports_1.AudioStreamNodeAttachedEvent && e.AudioSourceId === _this.audioSourceId && e.AudioNodeId === _this.audioNodeId) {
                _this.micStartTime = e.EventTime;
            }
            if (e instanceof Exports_1.AudioSourceErrorEvent && e.AudioSourceId === _this.audioSourceId) {
                if (!_this.micMetric) {
                    _this.micMetric = {
                        End: e.EventTime,
                        Error: e.Error,
                        Name: "Microphone",
                        Start: _this.micStartTime,
                    };
                }
            }
            if (e instanceof Exports_1.AudioStreamNodeErrorEvent && e.AudioSourceId === _this.audioSourceId && e.AudioNodeId === _this.audioNodeId) {
                if (!_this.micMetric) {
                    _this.micMetric = {
                        End: e.EventTime,
                        Error: e.Error,
                        Name: "Microphone",
                        Start: _this.micStartTime,
                    };
                }
            }
            if (e instanceof Exports_1.AudioStreamNodeDetachedEvent && e.AudioSourceId === _this.audioSourceId && e.AudioNodeId === _this.audioNodeId) {
                if (!_this.micMetric) {
                    _this.micMetric = {
                        End: e.EventTime,
                        Name: "Microphone",
                        Start: _this.micStartTime,
                    };
                }
            }
            if (e instanceof RecognitionEvents_1.ConnectingToServiceEvent && e.RequestId === _this.requestId) {
                _this.connectionId = e.ConnectionId;
            }
            if (e instanceof Exports_1.ConnectionStartEvent && e.ConnectionId === _this.connectionId) {
                _this.connectionStartTime = e.EventTime;
            }
            if (e instanceof Exports_1.ConnectionEstablishedEvent && e.ConnectionId === _this.connectionId) {
                if (!_this.connectionEstablishMetric) {
                    _this.connectionEstablishMetric = {
                        End: e.EventTime,
                        Id: _this.connectionId,
                        Name: "Connection",
                        Start: _this.connectionStartTime,
                    };
                }
            }
            if (e instanceof Exports_1.ConnectionEstablishErrorEvent && e.ConnectionId === _this.connectionId) {
                if (!_this.connectionEstablishMetric) {
                    _this.connectionEstablishMetric = {
                        End: e.EventTime,
                        Error: _this.GetConnectionError(e.StatusCode),
                        Id: _this.connectionId,
                        Name: "Connection",
                        Start: _this.connectionStartTime,
                    };
                }
            }
            if (e instanceof Exports_1.ConnectionMessageReceivedEvent && e.ConnectionId === _this.connectionId) {
                if (e.Message && e.Message.Headers && e.Message.Headers.path) {
                    if (!_this.receivedMessages[e.Message.Headers.path]) {
                        _this.receivedMessages[e.Message.Headers.path] = new Array();
                    }
                    _this.receivedMessages[e.Message.Headers.path].push(e.NetworkReceivedTime);
                }
            }
        };
        this.GetTelemetry = function () {
            var metrics = new Array();
            if (_this.listeningTriggerMetric) {
                metrics.push(_this.listeningTriggerMetric);
            }
            if (_this.micMetric) {
                metrics.push(_this.micMetric);
            }
            if (_this.connectionEstablishMetric) {
                metrics.push(_this.connectionEstablishMetric);
            }
            var telemetry = {
                Metrics: metrics,
                ReceivedMessages: _this.receivedMessages,
            };
            var json = JSON.stringify(telemetry);
            // We dont want to send the same telemetry again. So clean those out.
            _this.receivedMessages = {};
            _this.listeningTriggerMetric = null;
            _this.micMetric = null;
            _this.connectionEstablishMetric = null;
            return json;
        };
        this.Dispose = function () {
            _this.isDisposed = true;
        };
        this.GetConnectionError = function (statusCode) {
            /*
            -- Websocket status codes --
            NormalClosure = 1000,
            EndpointUnavailable = 1001,
            ProtocolError = 1002,
            InvalidMessageType = 1003,
            Empty = 1005,
            InvalidPayloadData = 1007,
            PolicyViolation = 1008,
            MessageTooBig = 1009,
            MandatoryExtension = 1010,
            InternalServerError = 1011
            */
            switch (statusCode) {
                case 400:
                case 1002:
                case 1003:
                case 1005:
                case 1007:
                case 1008:
                case 1009: return "BadRequest";
                case 401: return "Unauthorized";
                case 403: return "Forbidden";
                case 503:
                case 1001: return "ServerUnavailable";
                case 500:
                case 1011: return "ServerError";
                case 408:
                case 504: return "Timeout";
                default: return "statuscode:" + statusCode.toString();
            }
        };
        this.requestId = requestId;
        this.audioSourceId = audioSourceId;
        this.audioNodeId = audioNodeId;
        this.receivedMessages = {};
    }
    return ServiceTelemetryListener;
}());
exports.ServiceTelemetryListener = ServiceTelemetryListener;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(3);
var Exports_1 = __webpack_require__(0);
var PathHeaderName = "path";
var ContentTypeHeaderName = "content-type";
var RequestIdHeaderName = "x-requestid";
var RequestTimestampHeaderName = "x-timestamp";
var SpeechConnectionMessage = (function (_super) {
    tslib_1.__extends(SpeechConnectionMessage, _super);
    function SpeechConnectionMessage(messageType, path, requestId, contentType, body, additionalHeaders, id) {
        var _this = this;
        if (!path) {
            throw new Exports_1.ArgumentNullError("path");
        }
        if (!requestId) {
            throw new Exports_1.ArgumentNullError("requestId");
        }
        var headers = {};
        headers[PathHeaderName] = path;
        headers[RequestIdHeaderName] = requestId;
        headers[RequestTimestampHeaderName] = new Date().toISOString();
        if (contentType) {
            headers[ContentTypeHeaderName] = contentType;
        }
        if (additionalHeaders) {
            for (var headerName in additionalHeaders) {
                if (headerName) {
                    headers[headerName] = additionalHeaders[headerName];
                }
            }
        }
        if (id) {
            _this = _super.call(this, messageType, body, headers, id) || this;
        }
        else {
            _this = _super.call(this, messageType, body, headers) || this;
        }
        _this.path = path;
        _this.requestId = requestId;
        _this.contentType = contentType;
        _this.additionalHeaders = additionalHeaders;
        return _this;
    }
    Object.defineProperty(SpeechConnectionMessage.prototype, "Path", {
        get: function () {
            return this.path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionMessage.prototype, "RequestId", {
        get: function () {
            return this.requestId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionMessage.prototype, "ContentType", {
        get: function () {
            return this.contentType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechConnectionMessage.prototype, "AdditionalHeaders", {
        get: function () {
            return this.additionalHeaders;
        },
        enumerable: true,
        configurable: true
    });
    return SpeechConnectionMessage;
}(Exports_1.ConnectionMessage));
SpeechConnectionMessage.FromConnectionMessage = function (message) {
    var path = null;
    var requestId = null;
    var contentType = null;
    var requestTimestamp = null;
    var additionalHeaders = {};
    if (message.Headers) {
        for (var headerName in message.Headers) {
            if (headerName) {
                if (headerName.toLowerCase() === PathHeaderName.toLowerCase()) {
                    path = message.Headers[headerName];
                }
                else if (headerName.toLowerCase() === RequestIdHeaderName.toLowerCase()) {
                    requestId = message.Headers[headerName];
                }
                else if (headerName.toLowerCase() === RequestTimestampHeaderName.toLowerCase()) {
                    requestTimestamp = message.Headers[headerName];
                }
                else if (headerName.toLowerCase() === ContentTypeHeaderName.toLowerCase()) {
                    contentType = message.Headers[headerName];
                }
                else {
                    additionalHeaders[headerName] = message.Headers[headerName];
                }
            }
        }
    }
    return new SpeechConnectionMessage(message.MessageType, path, requestId, contentType, message.Body, additionalHeaders, message.Id);
};
exports.SpeechConnectionMessage = SpeechConnectionMessage;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var RecognitionStatus;
(function (RecognitionStatus) {
    RecognitionStatus[RecognitionStatus["Success"] = 0] = "Success";
    RecognitionStatus[RecognitionStatus["NoMatch"] = 1] = "NoMatch";
    RecognitionStatus[RecognitionStatus["InitialSilenceTimeout"] = 2] = "InitialSilenceTimeout";
    RecognitionStatus[RecognitionStatus["BabbleTimeout"] = 3] = "BabbleTimeout";
    RecognitionStatus[RecognitionStatus["Error"] = 4] = "Error";
    RecognitionStatus[RecognitionStatus["EndOfDictation"] = 5] = "EndOfDictation";
})(RecognitionStatus = exports.RecognitionStatus || (exports.RecognitionStatus = {}));


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = __webpack_require__(0);
var CRLF = "\r\n";
var WebsocketMessageFormatter = (function () {
    function WebsocketMessageFormatter() {
        var _this = this;
        this.ToConnectionMessage = function (message) {
            var deferral = new Exports_1.Deferred();
            try {
                if (message.MessageType === Exports_1.MessageType.Text) {
                    var textMessage = message.TextContent;
                    var headers = {};
                    var body = null;
                    if (textMessage) {
                        var headerBodySplit = textMessage.split("\r\n\r\n");
                        if (headerBodySplit && headerBodySplit.length > 0) {
                            headers = _this.ParseHeaders(headerBodySplit[0]);
                            if (headerBodySplit.length > 1) {
                                body = headerBodySplit[1];
                            }
                        }
                    }
                    deferral.Resolve(new Exports_1.ConnectionMessage(message.MessageType, body, headers, message.Id));
                }
                else if (message.MessageType === Exports_1.MessageType.Binary) {
                    var binaryMessage = message.BinaryContent;
                    var headers = {};
                    var body = null;
                    if (!binaryMessage || binaryMessage.byteLength < 2) {
                        throw new Error("Invalid binary message format. Header length missing.");
                    }
                    var dataView = new DataView(binaryMessage);
                    var headerLength = dataView.getInt16(0);
                    if (binaryMessage.byteLength < headerLength + 2) {
                        throw new Error("Invalid binary message format. Header content missing.");
                    }
                    var headersString = "";
                    for (var i = 0; i < headerLength; i++) {
                        headersString += String.fromCharCode((dataView).getInt8(i + 2));
                    }
                    headers = _this.ParseHeaders(headersString);
                    if (binaryMessage.byteLength > headerLength + 2) {
                        body = binaryMessage.slice(2 + headerLength);
                    }
                    deferral.Resolve(new Exports_1.ConnectionMessage(message.MessageType, body, headers, message.Id));
                }
            }
            catch (e) {
                deferral.Reject("Error formatting the message. Error: " + e);
            }
            return deferral.Promise();
        };
        this.FromConnectionMessage = function (message) {
            var deferral = new Exports_1.Deferred();
            try {
                if (message.MessageType === Exports_1.MessageType.Text) {
                    var payload = "" + _this.MakeHeaders(message) + CRLF + (message.TextBody ? message.TextBody : "");
                    deferral.Resolve(new Exports_1.RawWebsocketMessage(Exports_1.MessageType.Text, payload, message.Id));
                }
                else if (message.MessageType === Exports_1.MessageType.Binary) {
                    var headersString = _this.MakeHeaders(message);
                    var content_1 = message.BinaryBody;
                    var fr_1 = new FileReader();
                    fr_1.onload = function () {
                        var headerInt8Array = new Int8Array(fr_1.result);
                        var payload = new ArrayBuffer(2 + headerInt8Array.byteLength + (content_1 ? content_1.byteLength : 0));
                        var dataView = new DataView(payload);
                        dataView.setInt16(0, headerInt8Array.length);
                        for (var i = 0; i < headerInt8Array.byteLength; i++) {
                            dataView.setInt8(2 + i, headerInt8Array[i]);
                        }
                        if (content_1) {
                            var bodyInt8Array = new Int8Array(content_1);
                            for (var i = 0; i < bodyInt8Array.byteLength; i++) {
                                dataView.setInt8(2 + headerInt8Array.byteLength + i, bodyInt8Array[i]);
                            }
                        }
                        deferral.Resolve(new Exports_1.RawWebsocketMessage(Exports_1.MessageType.Binary, payload, message.Id));
                    };
                    fr_1.onerror = function () {
                        deferral.Reject("failed to load headers into file reader");
                    };
                    fr_1.readAsArrayBuffer(new Blob([headersString]));
                }
            }
            catch (e) {
                deferral.Reject("Error formatting the message. " + e);
            }
            return deferral.Promise();
        };
        this.MakeHeaders = function (message) {
            var headersString = "";
            if (message.Headers) {
                for (var header in message.Headers) {
                    if (header) {
                        headersString += header + ": " + message.Headers[header] + CRLF;
                    }
                }
            }
            return headersString;
        };
        this.ParseHeaders = function (headersString) {
            var headers = {};
            if (headersString) {
                var headerMatches = headersString.match(/[^\r\n]+/g);
                if (headers) {
                    for (var _i = 0, headerMatches_1 = headerMatches; _i < headerMatches_1.length; _i++) {
                        var header = headerMatches_1[_i];
                        if (header) {
                            var seperatorIndex = header.indexOf(":");
                            var headerName = seperatorIndex > 0 ? header.substr(0, seperatorIndex).trim().toLowerCase() : header;
                            var headerValue = seperatorIndex > 0 && header.length > (seperatorIndex + 1) ?
                                header.substr(seperatorIndex + 1).trim() :
                                "";
                            headers[headerName] = headerValue;
                        }
                    }
                }
            }
            return headers;
        };
    }
    return WebsocketMessageFormatter;
}());
exports.WebsocketMessageFormatter = WebsocketMessageFormatter;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SpeechRecognition_1 = __webpack_require__(19);
exports.SpeechRecognizer = SpeechRecognition_1.SpeechRecognizer;
var SpeechSynthesis_1 = __webpack_require__(20);
exports.SpeechSynthesizer = SpeechSynthesis_1.SpeechSynthesizer;
exports.SynthesisGender = SpeechSynthesis_1.SynthesisGender;


/***/ }),
/* 59 */
/***/ (function(module, exports) {

// Provide a "System" global.
module.exports = {
	// Make sure import is only used as "System.import"
	import: function() {
		throw new Error("System.import cannot be used indirectly");
	}
};


/***/ })
/******/ ]);
});
//# sourceMappingURL=CognitiveServices.js.map