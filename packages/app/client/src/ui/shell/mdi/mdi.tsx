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
import {
  CONTENT_TYPE_APP_SETTINGS,
  CONTENT_TYPE_LIVE_CHAT,
  CONTENT_TYPE_TRANSCRIPT,
  CONTENT_TYPE_WELCOME_PAGE
} from '../../../constants';
import { Document } from '../../../data/reducer/editor';
import { EditorFactory } from '../../editor';
import { Content as TabbedDocumentContent, MultiTabs, Tab as TabbedDocumentTab, TabbedDocument } from '../multiTabs';
import { MDIProps } from './mdiContainer';
import { Tab } from './tab/tab';

export class MDIComponent extends React.Component<MDIProps> {

  render() {
    const activeIndex = this.props.tabOrder.findIndex(documentId => documentId === this.props.activeDocumentId);
    return (
      <MultiTabs
        onChange={ this.handleTabChange }
        value={ activeIndex ? activeIndex : 0 }
        owningEditor={ this.props.owningEditor }
      >
        {
          this.props.tabOrder.map(documentId => {
            const document = this.props.documents[documentId];
            const isActive = documentId === this.props.activeDocumentId;
            return (
              <TabbedDocument key={ documentId }>
                <TabbedDocumentTab>
                  <Tab
                    active={ isActive }
                    dirty={ document.dirty }
                    documentId={ documentId }
                    label={ this.getTabLabel(document) }
                    onCloseClick={ this.props.closeTab }/>
                </TabbedDocumentTab>
                <TabbedDocumentContent documentId={ documentId }>
                  <EditorFactory document={ document }/>
                </TabbedDocumentContent>
              </TabbedDocument>
            );
          })
        }
      </MultiTabs>
    );
  }

  private handleTabChange = (tabValue) => {
    this.props.setActiveTab(this.props.tabOrder[tabValue]);
  }

  private getTabLabel(document: Document): string {
    switch (document.contentType) {
      case CONTENT_TYPE_APP_SETTINGS:
        return 'Emulator Settings';

      case CONTENT_TYPE_WELCOME_PAGE:
        return 'Welcome';

      case CONTENT_TYPE_TRANSCRIPT:
        return document.fileName || 'Transcript';

      case CONTENT_TYPE_LIVE_CHAT:
        let label = 'Live Chat';
        const { services = [] } = this.props.activeBot || {};
        const { endpointId = null } = this.props.chats[document.documentId] || {};
        const botEndpoint = services.find(s => s.id === endpointId);

        if (botEndpoint) {
          label += ` (${ botEndpoint.name })`;
        }
        return label;

      default:
        return '';
    }
  }
}
