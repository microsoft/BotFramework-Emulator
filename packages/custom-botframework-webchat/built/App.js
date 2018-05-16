"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const Chat_1 = require("./Chat");
const konsole = require("./Konsole");
exports.App = (props, container) => {
    konsole.log("BotChat.App props", props);
    ReactDOM.render(React.createElement(AppContainer, props), container);
};
const AppContainer = (props) => React.createElement("div", { className: "wc-app" },
    React.createElement(Chat_1.Chat, Object.assign({}, props)));
//# sourceMappingURL=App.js.map