"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = (message, ...optionalParams) => {
    if (typeof (window) !== 'undefined' && window["botchatDebug"] && message)
        console.log(message, ...optionalParams);
};
//# sourceMappingURL=Konsole.js.map