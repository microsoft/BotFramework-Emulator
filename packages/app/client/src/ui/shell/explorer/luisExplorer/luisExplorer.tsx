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

import { ILuisService } from 'msbot/bin/schema';
import { LuisService } from 'msbot/bin/models';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { LuisEditorContainer } from './luisEditor';

export interface LuisProps extends ServicePaneProps {
  luisServices?: ILuisService[];
  launchLuisEditor: (luisEditor: ComponentClass<any>) => void;
  openLuisDeepLink: (luisService: ILuisService) => void;
}

export class LuisExplorer extends ServicePane<LuisProps> {
  public state = {} as { expanded?: boolean };

  constructor(props: LuisProps, context: {}) {
    super(props, context);
  }

  protected get links() {
    const { luisServices = [] } = this.props;
    return luisServices
      .map((model, index) => {
        return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
      });
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: luisService } = this.props.luisServices;
    this.props.openLuisDeepLink(luisService);
  }

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: luisService } = this.props.luisServices;
    this.props.openContextMenu(new LuisService(luisService), LuisEditorContainer);
  }

  protected onAddIconClick = (_event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchLuisEditor(LuisEditorContainer);
  }
}
