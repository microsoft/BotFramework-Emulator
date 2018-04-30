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
import { IBotConfig } from 'msbot/bin/schema';
import * as React from 'react';

import { Fonts } from '@bfemulator/ui-react';
import { Extension } from '../../../../extensions';
import { Inspector } from './inspector';
import { IExtensionInspector } from '@bfemulator/sdk-shared';

const CSS = css({
  padding: 0,
  height: '100%',
  fontFamily: Fonts.FONT_FAMILY_MONOSPACE,
  wordWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  overflowY: 'auto',
  userSelect: 'text',
  boxSizing: 'border-box',
});

export interface DetailProps {
  bot: IBotConfig;
  document: any;
  inspectObj: any;
  extension: Extension;
  inspector: IExtensionInspector;
  enableAccessory: (id: string, enable: boolean) => void;
  setAccessoryState: (id: string, state: string) => void;
  setInspectorTitle: (title: string) => void;
}

export class Detail extends React.Component<DetailProps> {

  inspectorRef: any;

  toggleDevTools() {
    if (this.inspectorRef) {
      this.inspectorRef.toggleDevTools();
    }
  }

  accessoryClick(id: string) {
    if (this.inspectorRef) {
      this.inspectorRef.accessoryClick(id);
    }
  }

  render() {
    return (
      <div { ...CSS } >
        <Inspector
          ref={ ref => this.inspectorRef = ref }
          bot={ this.props.bot }
          document={ this.props.document }
          extension={ this.props.extension }
          inspector={ this.props.inspector }
          inspectObj={ this.props.inspectObj }
          enableAccessory={ this.props.enableAccessory }
          setAccessoryState={ this.props.setAccessoryState }
          setInspectorTitle={ this.props.setInspectorTitle }
        />
      </div>
    );
  }
}
