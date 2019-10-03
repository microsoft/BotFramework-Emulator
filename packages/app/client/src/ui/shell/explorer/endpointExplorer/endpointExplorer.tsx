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

import { EndpointService } from 'botframework-config/lib/models';
import { IEndpointService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';

import { ServicePane, ServicePaneProps } from '../servicePane/servicePane';

import { EndpointEditorContainer } from './endpointEditor';
import * as styles from './endpointExplorer.scss';

export interface EndpointProps extends ServicePaneProps {
  endpointServices?: IEndpointService[];
  launchEndpointEditor: (endpointEditor: ComponentClass<any>) => Promise<void>;
  openEndpointInEmulator: (endpointService: IEndpointService) => void;
}

export class EndpointExplorer extends ServicePane<EndpointProps> {
  public state = { expanded: true } as { expanded?: boolean };

  constructor(props: EndpointProps, context: {}) {
    super(props, context);
  }

  protected get links() {
    const { endpointServices = [] } = this.props;
    return endpointServices.map((model, index) => {
      return (
        <li
          data-index={index}
          key={index}
          onClick={this.onLinkClick}
          onKeyPress={this.onHandleKeyPress}
          tabIndex={0}
          title={model.endpoint}
        >
          <svg
            className={styles.messageIcon}
            xmlns="http://www.w3.org/2000/svg"
            role="presentation"
            viewBox="0 0 16 16"
            width="12px"
            height="12px"
          >
            <path d="M0 1h16v11H5.71L2 15.71V12H0V1zm15 10V2H1v9h2v2.29L5.29 11H15z" />
          </svg>
          {model.name}
        </li>
      );
    });
  }

  protected get controls(): JSX.Element {
    const controls = { ...super.controls };
    controls.props = { ...controls.props };
    controls.props.children = [controls.props.children[1]]; // Remove the sort icon
    return controls;
  }

  protected onHandleKeyPress = (e): void => {
    if (e.key === 'Enter') {
      this.onLinkClick(e);
    }
  };

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [+index]: endpointService } = this.props.endpointServices;
    this.props.openEndpointInEmulator(endpointService);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [+index]: endpointService } = this.props.endpointServices;
    this.props.openContextMenuForService(new EndpointService(endpointService), EndpointEditorContainer);
  }

  protected onAddIconClick = async (_event: SyntheticEvent<HTMLButtonElement>): Promise<void> => {
    await this.props.launchEndpointEditor(EndpointEditorContainer);
    this.addIconButtonRef && this.addIconButtonRef.focus();
  };

  protected onSortClick = (_event: SyntheticEvent<HTMLButtonElement>): void => {
    // TODO - Implement this.
  };

  protected setAddIconButtonRef = (ref: HTMLButtonElement): void => {
    this.addIconButtonRef = ref;
  };
}
