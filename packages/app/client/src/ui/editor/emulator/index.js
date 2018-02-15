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

import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

import ChatPanel from './chatPanel';
import DetailPanel from './detailPanel';
import LogPanel from './logPanel';
import Splitter from '../../layout/splitter-v2';
import ToolBar, { Button as ToolBarButton, Separator as ToolBarSeparator } from '../toolbar';
import { CommandService } from '../../../platform/commands/commandService';

const CSS = css({
  flex: 1,
  height: '100%',
});

export default class Emulator extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.onPresentationClick = this.handlePresentationClick.bind(this, "presentation");
    this.onStartOverClick = this.handleStartOverClick.bind(this, "start over");
    this.onExportClick = this.handleExportClick.bind(this, "export");
    this.onImportClick = this.handleImportClick.bind(this, "import");
  }

  handlePresentationClick() {
    CommandService.executeRemoteCommand('say:hello', { value: "What's up" });
  }

  handleStartOverClick() {
  }

  handleExportClick() {
  }

  handleImportClick() {
  }

  render() {
    return (
      <div className={CSS}>
        <ToolBar>
          <ToolBarButton title="Presentation" onClick={this.onPresentationClick} />
          <ToolBarSeparator />
          <ToolBarButton title="Start Over" onClick={this.onStartOverClick} />
          <ToolBarButton title="Export" onClick={this.handleExportClick} />
          <ToolBarButton title="Import" onClick={this.handleImportClick} />
        </ToolBar>
        <Splitter orientation={'vertical'} primaryPaneIndex={1} initialSizeIndex={2} initialSize={300} minSizes={[80, 80]}>
          <ChatPanel botId={this.props.botId} />
          <Splitter orientation={'horizontal'} primaryPaneIndex={0} initialSizeIndex={1} initialSize={500} minSizes={[80, 80]}>
            <LogPanel botId={this.props.botId} />
            <DetailPanel botId={this.props.botId} />
          </Splitter>
        </Splitter>
      </div>
    );
  }
}

Emulator.propTypes = {
  botId: PropTypes.string.isRequired
};
