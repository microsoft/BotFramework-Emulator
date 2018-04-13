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
import * as React from 'react';

import { Detail } from './parts/detail';
import Panel, { PanelControls, PanelContent } from '../panel';
import { ExtensionManager } from '../../../extensions';
import { IExtensionInspector, IInspectorAccessory } from '@bfemulator/sdk-shared';

const CSS = css({
  height: '100%'
});

interface IDetailPanelProps {
  document: any;
}

export default class DetailPanel extends React.Component<IDetailPanelProps, {}> {

  detailRef: any;

  constructor(props: IDetailPanelProps, context) {
    super(props, context);
  }

  onAccessoryClick = (id: string) => {
    if (this.detailRef) {
      this.detailRef.accessoryClick(id);
    }
  }

  onToggleDevToolsClick = () => {
    if (this.detailRef) {
      this.detailRef.toggleDevTools();
    }
  }

  renderPanelControls(inspector: IExtensionInspector) {
    const accessories = inspector.accessories || [];
    return (
      <PanelControls>
        { accessories.map(accessory => <button key={ accessory.id } onClick={ ev => this.onAccessoryClick(accessory.id) }>{ accessory.label }</button>) }
        <button key="devtools" onClick={ ev => this.onToggleDevToolsClick() }>DevTools</button>
      </PanelControls>
    );
  }

  render() {
    let obj = this.props.document.inspectorObjects && this.props.document.inspectorObjects.length ?
      this.props.document.inspectorObjects[0] : null;

    // Sometimes the activity is buried.
    if (obj && obj.activity) {
      obj = obj.activity;
    }

    // Find an inspector for this object.
    let insp = obj ? ExtensionManager.inspectorForObject(obj, true) : null;

    if (insp) {
      return (
        <div { ...CSS }>
          <Panel title={ `${insp.inspector.name} inspector` }>
            { this.renderPanelControls(insp.inspector) }
            <PanelContent>
              <Detail ref={ ref => this.detailRef = ref } document={ this.props.document } obj={ obj } extension={ insp.extension } inspector={ insp.inspector } />
            </PanelContent>
          </Panel>
        </div>
      );
    } else {
      return (
        // Placeholder. Need to figure out what to show if no viable inspector was found.
        <div { ...CSS }>
        </div>
      );
    }
  }
}
