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
import { connect } from 'react-redux';

import * as EditorActions from '../../../data/action/editorActions';
import { EditorFactory } from '../../editor';
import {
  MultiTabs,
  TabbedDocument,
  Tab as TabbedDocumentTab,
  Content as TabbedDocumentContent
} from '../multiTabs';
import { TabFactory } from './tabFactory';
import { IDocument } from '../../../data/reducer/editor';
import { RootState } from '../../../data/store';

interface MDIProps {
  activeDocumentId?: string;
  activeEditor?: string;
  documents?: { [documentId: string]: IDocument };
  tabOrder?: string[];
  owningEditor?: string;
  setActiveTab?: (tab: string) => void;
}

class MDIComponent extends React.Component<MDIProps> {
  constructor(props: MDIProps) {
    super(props);
  }

  private handleTabChange = (tabValue) => {
    this.props.setActiveTab(this.props.tabOrder[tabValue]);
  }

  render() {
    const activeIndex = this.props.tabOrder.findIndex(documentId => documentId === this.props.activeDocumentId);

    return (
      <MultiTabs
        onChange={ this.handleTabChange }
        value={ ~activeIndex ? activeIndex : 0 }
        owningEditor={ this.props.owningEditor }
      >
        {
          this.props.tabOrder.map(documentId =>
            <TabbedDocument key={ documentId }>
              <TabbedDocumentTab>
                <TabFactory document={ this.props.documents[documentId] } />
              </TabbedDocumentTab>
              <TabbedDocumentContent documentId={ documentId }>
                <EditorFactory document={ this.props.documents[documentId] } />
              </TabbedDocumentContent>
            </TabbedDocument>
          )
        }
      </MultiTabs>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: MDIProps): MDIProps => ({
  activeDocumentId: state.editor.editors[ownProps.owningEditor].activeDocumentId,
  documents: state.editor.editors[ownProps.owningEditor].documents,
  tabOrder: state.editor.editors[ownProps.owningEditor].tabOrder,
  activeEditor: state.editor.activeEditor
});

const mapDispatchToProps = (dispatch): MDIProps => ({
  setActiveTab: (tab: string) => dispatch(EditorActions.setActiveTab(tab))
});

export const MDI = connect(mapStateToProps, mapDispatchToProps)(MDIComponent);
