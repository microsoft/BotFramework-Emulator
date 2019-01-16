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

import { TextField } from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent, Component, ReactNode } from 'react';

import * as styles from './connectedServiceEditor.scss';

interface KvPairProps {
  kvPairs?: { [propName: string]: string };
  onChange: (kvPairs: { [propName: string]: string }) => void;
}

interface KvPairState {
  length: number;
  kvPairs: { key: string; value: string }[];
}

export class KvPair extends Component<KvPairProps, KvPairState> {
  public static getDerivedStateFromProps(
    nextProps: KvPairProps,
    prevState: KvPairState
  ): KvPairState {
    if (!prevState) {
      prevState = { length: 0, kvPairs: [] };
    }
    // Convert non-indexed object to indexed array
    // so we can track KV pairs when multiple
    // empty rows are added.
    const { kvPairs = {} } = nextProps;
    const kvPairsKeys = Object.keys(kvPairs);
    if (kvPairsKeys.length !== prevState.length) {
      return {
        kvPairs: kvPairsKeys.map(key => ({ key, value: nextProps[key] })),
        length: kvPairsKeys.length,
      };
    }

    return prevState;
  }

  // eslint-disable-next-line typescript/no-object-literal-type-assertion
  public constructor(props: KvPairProps = {} as KvPairProps) {
    super(props);
    this.state = KvPair.getDerivedStateFromProps(props, null);
  }

  public render(): ReactNode {
    const { length, kvPairs } = this.state;
    const numEmptyRows = 1 + length - kvPairs.length;
    const rows = [];

    kvPairs.forEach((kvPair, index) => {
      rows.push(
        <li key={index}>{this.getTextFieldPair(kvPair.key, kvPair.value)}</li>
      );
    });

    for (let i = 0; i < numEmptyRows; i++) {
      rows.push(<li key={kvPairs.length + i}>{this.getTextFieldPair()}</li>);
    }

    return (
      <div>
        <header className={styles.header}>
          <span>Key</span>
          <span>Value</span>
        </header>
        <ul className={styles.kvPairContainer}>{rows}</ul>
      </div>
    );
  }

  private getTextFieldPair(key: string = '', value: string = ''): ReactNode {
    return (
      <>
        <TextField
          className={styles.noBorder}
          placeholder="Add a key (optional)"
          value={key}
          data-prop="key"
          onChange={this.onChange}
        />
        <TextField
          className={styles.noBorder}
          placeholder="Add a value (optional)"
          disabled={!key || !key.trim()}
          value={value}
          data-prop="value"
          onChange={this.onChange}
        />
      </>
    );
  }

  private onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { target } = event;
    const { prop } = target.dataset;
    const targetLi = target.parentElement.parentElement as HTMLOListElement;
    const index = Array.prototype.findIndex.call(
      targetLi.parentElement.children,
      li => li === targetLi
    );
    const { kvPairs } = this.state;
    if (!kvPairs[index]) {
      kvPairs[index] = { key: '', value: '' };
    }
    kvPairs[index][prop] = (target as HTMLInputElement).value;
    this.setState({ kvPairs: [...kvPairs], length: kvPairs.length });

    this.props.onChange(
      kvPairs.reduce((kvPairMap, kvPair) => {
        if (kvPair.key && kvPair.key.trim()) {
          kvPairMap[kvPair.key] = kvPair.value;
        }
        return kvPairMap;
      }, {})
    );
  };
}
