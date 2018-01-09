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
import PropTypes from 'prop-types';
import classNames from 'classnames';
if (typeof window !== 'undefined') { require = window['require']; }
const fs = require('fs');

import * as CardActions from '../../../data/action/cardActions';

const CSS = css({
    height: '100%',
    width: '100%',
    overflow: 'hidden',

    ' > div': {
        height: '100%'
    },

    ' .json-header': {
        paddingLeft: '24px',
        fontFamily: 'Segoe UI Semibold',
        textTransform: 'uppercase',
        backgroundColor: '#767676',
        width: '100%',
        display: 'flex',
        color: '#FFFFFF',

        ' > span': {
            display: 'flex',
            marginLeft: 'auto',
            marginRight: '16px',
            cursor: 'pointer',
            userSelect: 'none'
        },

        ' > .save-disabled': { color: '#CCC' }
    }
});

// It's necessary to store a global copy of the AMD require from
// Monaco's loader.js. The first time this component is mounted,
// loading the external/vs/loader.js script causes the global.require
// to be overwritten with the AMD require, which allows us grab a reference to it.
// However, on successive loads of external/vs/loader.js
// (like when navigating to a different tab and then back), the global.require
// is not overwritten with the AMD require, so we lose the reference and Monaco
// fails to load because it is not the expected require, but the Node/Electron require.
var amdRequire;

class CardJsonEditor extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.saveContainer = this.saveContainer.bind(this);
        this.saveCard = this.saveCard.bind(this);

        this.state = { loaderReady: false, saveEnabled: false };
    }

    componentDidMount() {
        if (window.monaco && window.monaco.editor && amdRequire) {
            this.setState(() => ({ loaderReady: true }));
        } else {
            // store electron information so that we can swap it back later
            const electronModule = global.module;
            const electronRequire = global.require;
            const electronProcess = global.process;

            if (location.protocol === 'http:') {
                // pretend that we aren't in electron so that the monaco loader
                // tries to load from the server and not the electron app root
                global.module = undefined;
                global.process = undefined;
            }

            // load the monaco loader
            const scriptTag = document.createElement('script');
            scriptTag.setAttribute('src', 'external/vs/loader.js');
            scriptTag.addEventListener('load', () => {
                // grab the monaco amd loader
                if (!amdRequire) {
                    amdRequire = global.require;
                }

                // swap globals back to original electron state
                global.module = electronModule;
                global.require = electronRequire;
                global.process = electronProcess;

                document.body.removeChild(scriptTag);

                this.setState(() => ({ loaderReady: true }));
            });

            document.body.appendChild(scriptTag);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { loaderReady: prevLoaderReady } = prevState || {};
        const { editorWidth: prevEditorWidth, cardId: prevCardId, cardJson: prevCardJson } = prevProps || null;

        if (prevEditorWidth && this._editor) {
            this._editor.layout();
        }

        // if we switched to another asset tab and back, then we need to load the loader again
        if (!prevLoaderReady && this.state.loaderReady) {
            if (location.protocol === 'http:') {
                amdRequire.config({
                    baseUrl: '/external/'
                });
            } else {
                amdRequire.config({
                    baseUrl: require('url').resolve(location.href, 'external/')
                });
            }

            // The following two hacks are copied from
            // https://github.com/Microsoft/monaco-editor-samples/blob/master/sample-electron/index.html

            // workaround monaco-css not understanding the environment
            self.module = undefined;

            // workaround monaco-typescript not understanding the environment
            self.process.browser = true;

            if (window.monaco && window.monaco.editor) {
                this.initMonacoEditor();
            } else {
                amdRequire(['vs/editor/editor.main'], () => {
                    this.initMonacoEditor();
                });
            }
        }

        // if we switched between card tabs
        if (prevCardId && prevCardId !== this.props.cardId) {
            // sync previous card with store so we don't lose state
            if (prevCardJson) {
                this.syncStoreWithCardJson(prevCardId, prevCardJson);
            }
            if (this._editor) {
                this._editor.setValue(this.props.cardJson);
            } else {
                this.initMonacoEditor();
            }
        }
    }

    // creates the monaco editor, inserts it into the DOM, and hooks up code change listener
    initMonacoEditor() {
        this._editor = window.monaco.editor.create(this.editorContainer, {
            value: this.props.cardJson,
            language: 'json',
            theme: 'vs-dark'
        });

        this._editor.onDidChangeModelContent(evt => {
            this.handleCodeChange(this._editor.getValue());
        });
    }

    // save a reference of the monaco editor container
    saveContainer(element) {
        this.editorContainer = element;
    }

    // handle changes to the monaco model
    handleCodeChange(newVal) {
        this.syncStoreWithCardJson(this.props.cardId, newVal);
        this.setState(() => ({ saveEnabled: true }));
    }

    // syncs the store version of the card with the supplied json
    // (used to sync component state's json with the store's json)
    syncStoreWithCardJson(cardId, json) {
        this.props.dispatch(CardActions.updateCardJson(cardId, json));
    }

    // saves the card to the file system
    saveCard() {
        if (this.state.saveEnabled) {
            const filePath = this.props.path;
            fs.writeFile(
                filePath,
                this.props.cardJson,
                'utf-8',
                (err) => {
                    if (err) {
                        console.log('Error saving adaptive card to file!', err);
                    } else {
                        this.setState(() => ({ saveEnabled: false }))
                    }
                }
            )
        }
    }

    render() {
        const saveBtnClass = this.state.saveEnabled ? '' : 'save-disabled';
        return (
            <div className={ CSS }>
                <span className='json-header'>Editor <span onClick={ this.saveCard } className={ saveBtnClass }>Save</span></span>
                <div ref={ this.saveContainer }>
                </div>
            </div>
        );
    }
}

CardJsonEditor.propTypes = {
    cardId: PropTypes.string,
    cardJson: PropTypes.string,
    editorWidth: PropTypes.number,
    path: PropTypes.string
};

export default connect((state, { cardId }) => ({
    cardJson: state.card.cards[cardId].cardJson,
    path: state.card.cards[cardId].path
}))(CardJsonEditor);
