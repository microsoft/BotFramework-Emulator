//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import { hot } from 'react-hot-loader';
import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from './welcomePage.scss';
import { Column, LargeHeader, PrimaryButton, Row, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { GenericDocument } from '../../layout';
import { SharedConstants } from '../../../../../shared/src/constants';
class WelcomePageComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onNewBotClick = () => {
            CommandServiceImpl.call(SharedConstants.Commands.UI.ShowBotCreationDialog).catch();
        };
        this.onOpenBotClick = () => {
            CommandServiceImpl.call(SharedConstants.Commands.Bot.OpenBrowse).catch();
        };
        this.onBotClick = (_e, path) => {
            CommandServiceImpl.call(SharedConstants.Commands.Bot.Switch, path).catch();
        };
    }
    render() {
        return (React.createElement(GenericDocument, null,
            React.createElement(LargeHeader, null, "Welcome to the Bot Framework Emulator!"),
            React.createElement(Row, null,
                React.createElement(Column, null,
                    React.createElement("div", { className: styles.section },
                        React.createElement(SmallHeader, null, "Start"),
                        React.createElement("span", null, "Start talking to your bot by connecting to an endpoint or by opening a bot saved locally. More about working locally with a bot."),
                        React.createElement(Row, null,
                            React.createElement(PrimaryButton, { className: styles.openBot, text: "Open Bot", onClick: this.onOpenBotClick })),
                        React.createElement("span", null,
                            "If you don\u2019t have a bot configuration,",
                            React.createElement("a", { className: styles.ctaLink, href: "javascript:void(0)", onClick: this.onNewBotClick }, "create a new bot configuration."))),
                    React.createElement("div", { className: styles.section },
                        React.createElement(SmallHeader, null, "My Bots"),
                        React.createElement("ul", { className: `${styles.recentBotsList} ${styles.well}` }, this.props.recentBots && this.props.recentBots.length ?
                            this.props.recentBots.slice(0, 10).map(bot => bot &&
                                React.createElement("li", { key: bot.path },
                                    React.createElement("a", { href: "javascript:void(0);", onClick: ev => this.onBotClick(ev, bot.path), title: bot.path },
                                        React.createElement(TruncateText, null, bot.displayName)),
                                    React.createElement(TruncateText, { className: styles.recentBotDetail, title: bot.path }, bot.path)))
                            :
                                React.createElement("li", null,
                                    React.createElement("span", { className: styles.noBots },
                                        React.createElement(TruncateText, null, "No recent bots")))))),
                React.createElement(Column, { className: styles.rightColumn },
                    React.createElement("div", { className: styles.section },
                        React.createElement(SmallHeader, null, "Help"),
                        React.createElement("ul", null,
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://aka.ms/BotBuilderOverview" },
                                    React.createElement(TruncateText, null, "Overview"))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://aka.ms/Btovso" },
                                    React.createElement(TruncateText, null, "GitHub Repository"))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://aka.ms/BotBuilderLocalDev" },
                                    React.createElement(TruncateText, null, "Starting with Local Development"))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://aka.ms/BotBuilderAZCLI" },
                                    React.createElement(TruncateText, null, "Starting with Azure CLI"))),
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://aka.ms/BotBuilderIbiza" },
                                    React.createElement(TruncateText, null, "Starting with the Azure Portal")))))))));
    }
}
const mapStateToProps = (state) => ({
    recentBots: state.bot.botFiles
});
export const WelcomePage = connect(mapStateToProps)(hot(module)(WelcomePageComponent));
//# sourceMappingURL=welcomePage.js.map