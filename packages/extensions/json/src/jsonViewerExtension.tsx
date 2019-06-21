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
import { Component } from 'react';
import { CollapsibleJsonViewer } from '@bfemulator/ui-react';
import { ValueTypes } from '@bfemulator/app-shared/built/enums';
import { CollapsibleJsonViewerProps } from '@bfemulator/ui-react/src';

import './index.scss';

interface JsonViewerExtensionState extends CollapsibleJsonViewerProps {
  isDiff?: boolean;
}

export class JsonViewerExtension extends Component<{}, JsonViewerExtensionState> {
  public state = { data: {}, themeName: 'light' } as JsonViewerExtensionState;
  private diffNodesMap = new Map<HTMLElement, boolean>();

  private static nodeColorVarName(paths: string[]): string {
    let i = paths.length;
    while (i--) {
      const path = paths[i];
      if (('' + path).startsWith('-')) {
        return '--log-panel-item-error';
      }
      if (('' + path).startsWith('+')) {
        return '--log-panel-timestamp';
      }
    }
    return '--log-panel-item-info';
  }

  public render() {
    const { themeName, data } = this.state;
    return (
      <div>
        <CollapsibleJsonViewer
          getItemString={() => ''}
          labelRenderer={this.labelRenderer}
          valueRenderer={this.valueRenderer}
          shouldExpandNode={this.shouldExpandNodeCallback}
          themeName={themeName}
          data={data}
        />
      </div>
    );
  }

  public setData(data: Record<string, any>): void {
    this.diffNodesMap.clear();
    const isDiff = data.valueType === ValueTypes.Diff;
    if (data && (data.valueType === ValueTypes.BotState || isDiff)) {
      this.setState({ data: data.value, isDiff });
    } else {
      this.setState({ data, isDiff });
    }
  }

  public setTheme(themeName: string) {
    this.setState({ themeName });
  }

  private labelRenderer = (path: string[]) => {
    if (this.state.isDiff) {
      const color = JsonViewerExtension.nodeColorVarName(path);
      return <span style={{ color: `var(${color}` }}>{path[0]}: </span>;
    }
    return `${path[0]}: `;
  };

  private valueRenderer = (...path: string[]) => {
    if (this.state.isDiff) {
      const color = JsonViewerExtension.nodeColorVarName(path);
      return <span style={{ color: `var(${color}` }}>{path[0]}</span>;
    }
    return path[0];
  };

  private shouldExpandNodeCallback = (keyName: string, data: any, level: number): boolean => {
    return level === 0 || this.state.isDiff;
  };
}
