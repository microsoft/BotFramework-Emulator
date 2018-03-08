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

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import * as constants from '../../../constants';
import * as EditorActions from '../../../data/action/editorActions';
import EditorFactory from '../../editor';
import MultiTabs from '../multiTabs';
import TabFactory from './tabFactory';
import TabbedDocument, { Tab as TabbedDocumentTab, Content as TabbedDocumentContent } from '../multiTabs/tabbedDocument';
import * as Constants from '../../../constants';
import { getBotDisplayName } from '@bfemulator/app-shared';
import { CommandRegistry } from '../../../commands';

class MDI extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(tabValue) {
    this.props.dispatch(EditorActions.setActiveTab(this.props.documents[tabValue].documentId));
  }

  componentWillMount() {
      this._openBotSettingsCommandHandler = CommandRegistry.registerCommand('bot:settings:open', (bot) => {
      this.props.dispatch(EditorActions.open(Constants.ContentType_BotSettings, Constants.DocumentId_BotSettings, false, bot.id));
    });
  }

  componentWillUnmount() {
    if (this._openBotSettingsCommandHandler) {
      this._openBotSettingsCommandHandler.dispose();
    }
  }

  render() {
    const activeIndex = this.props.documents.findIndex(document => document.documentId === this.props.activeDocumentId);

    return (
      <MultiTabs
        onChange={ this.handleTabChange }
        value={ ~activeIndex ? activeIndex : 0 }
        owningEditor={ this.props.owningEditor }
      >
        {
          this.props.documents.map(document =>
            <TabbedDocument key={ document.documentId }>
              <TabbedDocumentTab>
                <TabFactory document={ document } owningEditor={ this.props.owningEditor } />
              </TabbedDocumentTab>
              <TabbedDocumentContent owningEditor={ this.props.owningEditor }>
                <EditorFactory document={ document } />
              </TabbedDocumentContent>
            </TabbedDocument>
          )
        }
      </MultiTabs>
    );
  }
}

export default connect((state, { owningEditor }) => ({
  activeDocumentId: state.editor.editors[owningEditor].activeDocumentId,
  documents: state.editor.editors[owningEditor].documents,
  activeEditor: state.editor.activeEditor
}))(MDI)

MDI.propTypes = {
  activeDocumentId: PropTypes.string,
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      documentId: PropTypes.string,
      contentType: PropTypes.string
    })
  ),
  activeEditor: PropTypes.string,
  owningEditor: PropTypes.string
};
