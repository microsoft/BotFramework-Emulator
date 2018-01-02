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

import { connect } from 'react-redux'
import { css } from 'glamor'
import React from 'react'
import ReactDOM from 'react-dom';
import * as CardActions from '../../../../data/action/cardActions';

const CSS = css({
    height: "100%",
    width: "100%",
    overflow: "hidden",
    " > div": {
        height: "100%"
    },

    " .json-header": {
        paddingLeft: "24px",
        fontFamily: "Segoe UI Semibold",
        textTransform: "uppercase",
        backgroundColor: "#F5F5F5",
        width: "100%",
        display: "block",
        color: "#2B2B2B",
        borderBottom: "1px solid #C6C6C6"
    }
});

const debug = css({ backgroundColor: "teal" });

class CardJsonEditor extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.saveContainer = this.saveContainer.bind(this);
    }

    componentDidMount() {
        // store electron information so that we can swap it back later
        const electronModule = global.module;
        const electronRequire = global.require;
        const electronProcess = global.process;

        // pretend that we aren't in electron so that the monaco loader
        // tries to load from the server and not the electron app root
        global.module = undefined;
        global.process = undefined;

        // load the monaco loader
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('src', 'external/vs/loader.js');
        scriptTag.addEventListener('load', () => {
            // grab the monaco amd loader
            this._amdRequire = global.require;

            // swap globals back to original electron state
            global.module = electronModule;
            global.require = electronRequire;
            global.process = electronProcess;

            document.body.removeChild(scriptTag);

            this.setState(() => ({ loaderReady: true }));
        });

        document.body.appendChild(scriptTag);
    }

    componentDidUpdate(prevProps, prevState) {
        const { loaderReady: prevLoaderReady } = prevState || {};

        // if we have the monaco loader loaded, then let's create the editor
        if (!prevLoaderReady && this.state.loaderReady) {
            this._amdRequire.config({
                baseUrl: '/external/'
            });

            // The following two hacks are copied from
            // https://github.com/Microsoft/monaco-editor-samples/blob/master/sample-electron/index.html

            // workaround monaco-css not understanding the environment
            global.module = undefined;

            // workaround monaco-typescript not understanding the environment
            global.process.browser = true;

            this._amdRequire(['vs/editor/editor.main'], () => {
                this.editor = window.monaco.editor.create(this.editorContainer, {
                    value: this.props.cardJson,
                    language: 'json',
                    theme: "vs-dark"
                });

                this.editor.onDidChangeModelContent(evt => {
                    this.handleCodeChange(this.editor.getValue());
                });
            });
        }
    }

    // save a reference of the monaco editor container
    saveContainer(element) {
        this.editorContainer = element;
    }

    // handle changes to the monaco model
    handleCodeChange(newVal) {
        this.props.dispatch(CardActions.updateCardJson(newVal));
    }

    // need to call this.editor.layout() on splitter resize

    render() {
        return (
            <div {...CSS}>
                <span className={"json-header"}>Editor</span>
                <div ref={this.saveContainer}>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    cardJson: state.card.cardJson
}))(CardJsonEditor);
