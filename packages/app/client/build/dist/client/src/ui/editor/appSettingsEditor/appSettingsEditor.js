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
import * as React from 'react';
import { Checkbox, Column, PrimaryButton, Row, RowAlignment, RowJustification, SmallHeader, TextField } from '@bfemulator/ui-react';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import * as EditorActions from '../../../data/action/editorActions';
import * as Constants from '../../../constants';
import store from '../../../data/store';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { GenericDocument } from '../../layout';
import { debounce } from '../../../utils';
import * as styles from './appSettingsEditor.scss';
const defaultAppSettings = {
    bypassNgrokLocalhost: true,
    locale: '',
    localhost: '',
    ngrokPath: '',
    stateSizeLimit: 64,
    use10Tokens: false,
    useCodeValidation: false
};
function shallowEqual(x, y) {
    return (Object.keys(x).length === Object.keys(y).length
        && Object.keys(x).every(key => key in y && x[key] === y[key]));
}
export class AppSettingsEditor extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.setDirtyFlag = debounce((dirty) => store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty)), 300);
        this.onClickBrowse = this.onClickBrowse.bind(this);
        this.onChangeSizeLimit = this.onChangeSizeLimit.bind(this);
        this.onClickSave = this.onClickSave.bind(this);
        this.onChangeNgrok = this.onChangeNgrok.bind(this);
        this.onChangeNgrokBypass = this.onChangeNgrokBypass.bind(this);
        this.onChangeAuthTokenVersion = this.onChangeAuthTokenVersion.bind(this);
        this.onChangeUseValidationToken = this.onChangeUseValidationToken.bind(this);
        this.onClickDiscard = this.onClickDiscard.bind(this);
        this.onChangeLocalhost = this.onChangeLocalhost.bind(this);
        this.onChangeLocale = this.onChangeLocale.bind(this);
        this.state = {
            committed: Object.assign({}, defaultAppSettings),
            uncommitted: Object.assign({}, defaultAppSettings)
        };
    }
    componentWillMount() {
        // load settings from main and populate form
        CommandServiceImpl.remoteCall('app:settings:load')
            .then(settings => {
            this.setState(() => ({
                committed: settings,
                uncommitted: settings
            }));
        })
            .catch(err => console.error('Error while loading emulator settings: ', err));
    }
    setUncommittedState(patch) {
        this.setState(state => {
            const nextUncommitted = Object.assign({}, state.uncommitted, patch);
            const clean = shallowEqual(state.uncommitted, state.committed);
            const nextClean = shallowEqual(nextUncommitted, state.committed);
            if (nextClean !== clean) {
                this.setDirtyFlag(!nextClean);
            }
            return { uncommitted: nextUncommitted };
        });
    }
    commit(committed) {
        this.setState(() => {
            this.setDirtyFlag(false);
            return {
                committed: Object.assign({}, committed),
                uncommitted: Object.assign({}, committed)
            };
        });
    }
    onClickBrowse() {
        const dialogOptions = {
            title: 'Browse for ngrok',
            buttonLabel: 'Select ngrok',
            properties: ['openFile']
        };
        CommandServiceImpl.remoteCall('shell:showOpenDialog', dialogOptions)
            .then(ngrokPath => this.setUncommittedState({ ngrokPath }))
            .catch(err => console.log('User cancelled browsing for ngrok: ', err));
    }
    onChangeSizeLimit(e) {
        this.setUncommittedState({ stateSizeLimit: e.target.value });
    }
    onClickSave() {
        const { uncommitted } = this.state;
        const settings = {
            ngrokPath: uncommitted.ngrokPath.trim(),
            bypassNgrokLocalhost: uncommitted.bypassNgrokLocalhost,
            stateSizeLimit: +uncommitted.stateSizeLimit,
            use10Tokens: uncommitted.use10Tokens,
            useCodeValidation: uncommitted.useCodeValidation,
            localhost: uncommitted.localhost.trim(),
            locale: uncommitted.locale.trim()
        };
        CommandServiceImpl.remoteCall('app:settings:save', settings)
            .then(() => this.commit(settings))
            .catch(err => console.error('Error while saving emulator settings: ', err));
    }
    onChangeAuthTokenVersion() {
        this.setUncommittedState({ use10Tokens: !this.state.uncommitted.use10Tokens });
    }
    onChangeUseValidationToken() {
        this.setUncommittedState({ useCodeValidation: !this.state.uncommitted.useCodeValidation });
    }
    onChangeNgrok(ngrokPath) {
        this.setUncommittedState({ ngrokPath });
    }
    onChangeNgrokBypass() {
        this.setUncommittedState({ bypassNgrokLocalhost: !this.state.uncommitted.bypassNgrokLocalhost });
    }
    onChangeLocalhost(localhost) {
        this.setUncommittedState({ localhost });
    }
    onChangeLocale(locale) {
        this.setUncommittedState({ locale });
    }
    onClickDiscard() {
        const { DOCUMENT_ID_APP_SETTINGS } = Constants;
        store.dispatch(EditorActions.close(getTabGroupForDocument(this.props.documentId), DOCUMENT_ID_APP_SETTINGS));
    }
    render() {
        const { uncommitted } = this.state;
        const clean = shallowEqual(this.state.committed, uncommitted);
        return (React.createElement(GenericDocument, { className: styles.appSettingsEditor },
            React.createElement(Row, null,
                React.createElement(Column, null,
                    React.createElement(SmallHeader, null, "Service"),
                    React.createElement("p", null,
                        React.createElement("a", { href: "https://ngrok.com/", target: "_blank" }, "ngrok"),
                        " is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely. Read the ",
                        React.createElement("a", { href: "https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)", target: "_blank" }, "wiki page"),
                        " to learn more about using ngrok and to download it."),
                    React.createElement(Row, { align: RowAlignment.Center },
                        React.createElement(TextField, { className: styles.appSettingsInput, readOnly: false, value: uncommitted.ngrokPath, onChanged: this.onChangeNgrok, label: 'Path to ngrok' }),
                        React.createElement(PrimaryButton, { onClick: this.onClickBrowse, text: "Browse", className: styles.browseButton })),
                    React.createElement(Checkbox, { className: styles.checkboxOverrides, checked: uncommitted.bypassNgrokLocalhost, onChange: this.onChangeNgrokBypass, id: "ngrok-bypass", label: "Bypass ngrok for local addresses" }),
                    React.createElement(Row, { align: RowAlignment.Center },
                        React.createElement(TextField, { className: styles.appSettingsInput, readOnly: false, value: uncommitted.localhost, onChanged: this.onChangeLocalhost, label: "localhost override" })),
                    React.createElement(Row, { align: RowAlignment.Center },
                        React.createElement(TextField, { className: styles.appSettingsInput, readOnly: false, value: uncommitted.locale, onChanged: this.onChangeLocale, label: "Locale" }))),
                React.createElement(Column, { className: styles.rightColumn },
                    React.createElement(SmallHeader, null, "Auth"),
                    React.createElement(Checkbox, { className: styles.checkboxOverrides, checked: uncommitted.use10Tokens, onChange: this.onChangeAuthTokenVersion, id: "auth-token-version", label: "Use version 1.0 authentication tokens" }),
                    React.createElement(SmallHeader, null, "Sign-in"),
                    React.createElement(Checkbox, { className: styles.checkboxOverrides, checked: uncommitted.useCodeValidation, onChange: this.onChangeUseValidationToken, id: "use-validation-code", label: "Use a sign-in verification code for OAuthCards" }))),
            React.createElement(Row, { className: styles.buttonRow, justify: RowJustification.Right },
                React.createElement(PrimaryButton, { text: "Cancel", onClick: this.onClickDiscard }),
                React.createElement(PrimaryButton, { text: "Save", onClick: this.onClickSave, className: styles.saveButton, disabled: clean }))));
    }
}
//# sourceMappingURL=appSettingsEditor.js.map