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
import { connect } from 'react-redux';

import { Detail } from './parts';
import Panel, { PanelControls, PanelContent } from '../panel';
import { ExtensionManager, GetInspectorResult, Extension } from '../../../extensions';
import { ExtensionInspector, InspectorAccessory, InspectorAccessoryState } from '@bfemulator/sdk-shared';
import { RootState } from '../../../data/store';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Colors } from '@bfemulator/ui-react';

const CSS = css({
  height: '100%',

  '& .accessories': {
    '& .accessory-button': {
      height: '30px',
      whiteSpace: 'nowrap',
      display: 'flex',
      color: Colors.TOOLBAR_BUTTON_FOREGROUND_DARK,
      backgroundColor: Colors.TOOLBAR_BUTTON_BACKGROUND_DARK,

      '& .accessory-button-icon': {
        width: '30px'
      }
    },
    '& .accessory-button:disabled': {
      cursor: 'default',
      color: Colors.TOOLBAR_BUTTON_DISABLED_FOREGROUND_DARK
    },
    '& .accessory-button:active': {
      color: Colors.TOOLBAR_BUTTON_ACTIVE_FOREGROUND_DARK
    }
  }
});

interface DetailPanelProps {
  bot?: IBotConfig;
  document: any;
}

interface AccessoryButton {
  config: InspectorAccessory;
  state: string;
  enabled: boolean;
}

interface DetailPanelState {
  extension: Extension;
  inspector: ExtensionInspector;
  buttons: AccessoryButton[];
  inspectObj: any;
  title: string;
}

interface GetInspectorResultInternal {
  response: GetInspectorResult;
  inspectObj: any;
}

class DetailPanel extends React.Component<DetailPanelProps, DetailPanelState> {

  detailRef: any;

  constructor(props: DetailPanelProps, context: DetailPanelState) {
    super(props, context);
    this.state = {
      extension: null,
      inspector: null,
      buttons: [],
      inspectObj: null,
      title: ''
    };
  }

  componentDidUpdate(): void {
    let inspector: ExtensionInspector = null;
    let extension: Extension = null;

    const getInsp = this.getInspector();

    if (getInsp.response) {
      inspector = getInsp.response.inspector;
      extension = getInsp.response.extension;
    }

    if (this.state.inspector !== inspector || this.state.inspectObj !== getInsp.inspectObj) {
      const accessories = inspector ? inspector.accessories || [] : [];
      const title = inspector ? inspector.name || '' : '';
      this.setState({
        inspectObj: getInsp.inspectObj,
        title,
        inspector,
        extension,
        // Copy the accessories from the new inspector to this.state
        buttons: accessories.map(config => {
          // Accessory must have a "default" state to be added
          if (config && config.states.default) {
            return {
              config,
              state: 'default',
              enabled: true
            };
          } else {
            return null;
          }
        }).filter(accessoryState => !!accessoryState) || []
      });
    }
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

  enableAccessory = (id: string, enable: boolean) => {
    const button = this.state.buttons.find(buttonArg => buttonArg.config.id === id);
    if (button) {
      if (button.enabled !== enable) {
        button.enabled = enable;
        this.setState(this.state);
      }
    }
  }

  setAccessoryState = (id: string, state: string) => {
    const button = this.state.buttons.find(buttonArg => buttonArg.config.id === id);
    if (button && button.state !== state) {
      const { config } = button;
      if (config.states[state]) {
        button.state = state;
        this.setState(this.state);
      }
    }
  }

  setInspectortitle = (title: string) => {
    this.setState({
      ...this.state,
      title
    });
  }

  renderAccessoryIcon(config: InspectorAccessoryState) {
    if (config.icon === 'Spinner') {
      return (
        <Spinner className="accessory-button-icon" size={ SpinnerSize.xSmall } />
      );
    } else if (config.icon) {
      return (
        <i className={ `accessory-button-icon ms-Icon ms-Icon--${config.icon}` } aria-hidden="true"></i>
      );
    } else {
      return false;
    }
  }

  renderAccessoryButton(button: AccessoryButton, handler: (id: string) => void) {
    const { config, state, enabled } = button;
    const currentState = config.states[state] || {};
    return (
      <button
        className="accessory-button"
        key={ config.id }
        disabled={ !enabled }
        onClick={ () => handler(config.id) }>
        { this.renderAccessoryIcon(currentState) }
        { currentState.label }
      </button>
    );
  }

  renderAccessoryButtons(_inspector: ExtensionInspector) {
    return (
      <PanelControls>
        { this.state.buttons.map(a => this.renderAccessoryButton(a, this.onAccessoryClick)) }
      </PanelControls>
    );
  }

  render() {
    if (this.state.inspector) {
      // TODO - localization
      return (
        <div { ...CSS }>
          <Panel title={ ['inspector', this.state.title].filter(s => s && s.length).join(' - ') }>
            { this.renderAccessoryButtons(this.state.inspector) }
            <PanelContent>
              <Detail
                ref={ ref => this.detailRef = ref }
                bot={ this.props.bot }
                document={ this.props.document }
                inspectObj={ this.state.inspectObj }
                extension={ this.state.extension }
                inspector={ this.state.inspector }
                enableAccessory={ this.enableAccessory }
                setAccessoryState={ this.setAccessoryState }
                setInspectorTitle={ this.setInspectortitle }
              />
            </PanelContent>
          </Panel>
        </div>
      );
    } else {
      return (
        // No inspector was found.
        <div { ...CSS }>
          <Panel title={ `inspector` }>
          </Panel>
        </div>
      );
    }
  }

  private getInspector(): GetInspectorResultInternal {
    let obj = this.props.document.inspectorObjects && this.props.document.inspectorObjects.length ?
      this.props.document.inspectorObjects[0] : null;

    return {
      inspectObj: obj,
      // Find an inspector for this object.
      response: obj ? ExtensionManager.inspectorForObject(obj, true) : null
    };
  }
}

function mapStateToProps(state: RootState, ownProps: DetailPanelProps): DetailPanelProps {
  return {
    ...ownProps,
    bot: state.bot.activeBot
  };
}

export default connect(mapStateToProps)(DetailPanel);
