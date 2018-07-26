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
// Cheating here and pulling in a module from node. Can be easily replaced if we ever move the emulator to the web.
const crypto = window.require('crypto');
import { logEntry, LogLevel, textItem } from '@bfemulator/app-shared';
import * as React from 'react';
import { getActiveBot } from '../../../../../data/botHelpers';
import { InspectorAPI } from '../../../../../extensions';
import { LogService } from '../../../../../platform/log/logService';
import { SettingsService } from '../../../../../platform/settings/settingsService';
import * as styles from './inspector.scss';
export class Inspector extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.domReadyEventHandler = () => {
            this.botUpdated(getActiveBot());
            this.inspect(this.props.inspectObj);
        };
        this.ipcMessageEventHandler = (ev) => {
            // TODO - localization
            if (ev.channel === 'enable-accessory') {
                this.props.enableAccessory(ev.args[0], ev.args[1]);
            }
            else if (ev.channel === 'set-accessory-state') {
                this.props.setAccessoryState(ev.args[0], ev.args[1]);
            }
            else if (ev.channel === 'set-inspector-title') {
                this.setState(Object.assign({}, this.state, { titleOverride: ev.args[0] }));
                this.props.setInspectorTitle(ev.args[0]);
            }
            else if (ev.channel === 'logger.log') {
                const inspectorName = this.state.titleOverride || this.props.inspector.name || 'inspector';
                LogService.logToDocument(this.props.document.documentId, logEntry(textItem(LogLevel.Info, `[${inspectorName}] ${ev.args[0]}`)));
            }
            else if (ev.channel === 'logger.error') {
                const inspectorName = this.state.titleOverride || this.props.inspector.name || 'inspector';
                LogService.logToDocument(this.props.document.documentId, logEntry(textItem(LogLevel.Error, `[${inspectorName}] ${ev.args[0]}`)));
            }
            else {
                console.warn('Unexpected message from inspector', ev.channel, ...ev.args);
            }
        };
        this.updateRef = (ref) => {
            if (this.ref) {
                this.ref.removeEventListener('dom-ready', () => this.domReadyEventHandler());
                this.ref.removeEventListener('ipc-message', ev => this.ipcMessageEventHandler(ev));
            }
            this.ref = ref;
            if (this.ref) {
                this.ref.addEventListener('dom-ready', () => this.domReadyEventHandler());
                this.ref.addEventListener('ipc-message', ev => this.ipcMessageEventHandler(ev));
            }
        };
        this.handleDrag = (event) => {
            // prevent drag & drops inside of the inspector panel
            event.stopPropagation();
        };
        this.state = {
            botHash: this.hash(getActiveBot())
        };
    }
    componentDidMount() {
        window.addEventListener('toggle-inspector-devtools', () => this.toggleDevTools());
    }
    componentWillUnmount() {
        window.removeEventListener('toggle-inspector-devtools', () => this.toggleDevTools());
    }
    hash(obj) {
        const md5 = crypto.createHash('md5');
        md5.update(JSON.stringify(obj));
        return md5.digest('base64');
    }
    toggleDevTools() {
        this.sendToInspector('toggle-dev-tools');
    }
    accessoryClick(id) {
        this.sendToInspector('accessory-click', id);
    }
    canInspect(inspectObj) {
        return this.props.inspector.name === 'JSON' || InspectorAPI.canInspect(this.props.inspector, inspectObj);
    }
    inspect(obj) {
        if (this.canInspect(obj)) {
            this.sendToInspector('inspect', obj);
        }
    }
    botUpdated(bot) {
        this.sendToInspector('bot-updated', bot);
    }
    sendToInspector(channel, ...args) {
        if (this.ref) {
            try {
                this.ref.send(channel, ...args);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    shouldComponentUpdate(nextProps) {
        return this.props.inspectObj !== nextProps.inspectObj;
    }
    componentDidUpdate(prevProps) {
        const botHash = this.hash(getActiveBot());
        if (botHash !== this.state.botHash) {
            this.setState({
                botHash
            });
            this.botUpdated(getActiveBot());
        }
        if (prevProps.inspectObj && this.props.inspectObj) {
            if (JSON.stringify(prevProps.inspectObj) !== JSON.stringify(this.props.inspectObj)) {
                this.inspect(this.props.inspectObj);
            }
        }
        else {
            this.inspect(this.props.inspectObj);
        }
    }
    render() {
        const { updateRef, handleDrag } = this;
        const md5 = crypto.createHash('md5');
        md5.update(this.props.inspector.src);
        const hash = md5.digest('base64');
        const { cwdAsBase } = SettingsService.emulator;
        const fileLocation = `file://${cwdAsBase}/../../node_modules/@bfemulator/client/public/inspector-preload.js`;
        return (React.createElement("webview", { className: styles.inspector, webpreferences: "webSecurity=no", key: hash, partition: `persist:${hash}`, preload: fileLocation, ref: ref => updateRef(ref), src: this.props.inspector.src, onDragEnterCapture: handleDrag, onDragOverCapture: handleDrag }));
    }
}
//# sourceMappingURL=inspector.js.map