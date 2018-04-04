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
import * as PropTypes from 'prop-types';
import * as React from 'react';

import * as Colors from '../../../styles/colors';
import * as Fonts from '../../../styles/fonts';
import { ExtensionManager } from '../../../../extensions';
import { Inspector } from './inspector';

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

export interface Props {
  document: any;
}

export class Detail extends React.Component<Props> {
  render() {
    let obj = this.props.document.inspectorObjects && this.props.document.inspectorObjects.length ?
      this.props.document.inspectorObjects[0] : null;
    if (!obj || Object.keys(obj).length == 0) {
      return (
        <div { ...CSS } >
          <span>No activity selected</span>
        </div>
      );
    }
    // Sometimes the activity is buried.
    if (obj.activity) {
      obj = obj.activity;
    }
    // Find an inspecetor for this object
    let inspector = ExtensionManager.inspectorForObject(obj);
    if (!inspector) {
      // Default to the JSON inspector
      const jsonExtension = ExtensionManager.findExtension('JSON');
      if (jsonExtension) {
        inspector = jsonExtension.config.client.inspectors ? jsonExtension.config.client.inspectors[0] : null;
      }
    }
    if (inspector) {
      return (
        <div { ...CSS } >
          <Inspector inspector={ inspector } document={ this.props.document } src={ inspector.path } obj={ obj } />
        </div>
      );
    }
    return (
      <div { ...CSS } >
        <span>No inspector for this activity</span>
      </div>
    );
  }
}
