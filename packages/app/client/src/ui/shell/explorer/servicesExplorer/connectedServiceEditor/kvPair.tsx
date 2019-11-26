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

import { LinkButton, TextField, Row } from '@bfemulator/ui-react';
import * as React from 'react';
import { ChangeEvent, Component, ReactNode } from 'react';

import * as styles from './connectedServiceEditor.scss';

interface KvPairProps {
  onChange: (kvPairs: { [propName: string]: string }) => void;
}

interface KvPairState {
  alert: string;
  kvPairs: { key: string; value: string }[];
  numRows: number;
}

export class KvPair extends Component<KvPairProps, KvPairState> {
  public constructor(props: KvPairProps = {} as KvPairProps) {
    super(props);
    this.state = {
      alert: '',
      kvPairs: [{ key: '', value: '' }],
      numRows: 1,
    };
  }

  public render(): ReactNode {
    const { numRows, kvPairs } = this.state;

    return (
      <div>
        <Row className={styles.kvInputRow}>
          <div>
            <th className={styles.header}>Key</th>
            {kvPairs.map((pair, index) => (
              <tr key={index} className={styles.kvPairContainer}>
                {this.getTextFieldKey(pair.key, index)}
              </tr>
            ))}
          </div>
          <div>
            <th className={styles.header}>Value</th>
            {kvPairs.map((pair, index) => (
              <tr key={index} className={styles.kvPairContainer}>
                {this.getTextFieldValue(pair.key, pair.value, index)}
              </tr>
            ))}
          </div>
        </Row>
        <LinkButton
          ariaLabel="Add key value pair"
          className={`${styles.link} ${styles.kvSpacing}`}
          onClick={this.onAddKvPair}
        >
          + Add key value pair
        </LinkButton>
        <LinkButton
          ariaLabel="Remove key value pair"
          className={styles.link}
          disabled={numRows === 1}
          onClick={this.onRemoveKvPair}
        >
          - Remove key value pair
        </LinkButton>
        {this.alert}
      </div>
    );
  }

  private getTextFieldKey(key: string = '', index: number): ReactNode {
    let ref;
    if (index === this.state.numRows - 1) {
      ref = ref => {
        ref && ref.focus();
      };
    }

    return (
      <>
        <TextField
          inputContainerClassName={styles.kvInputKey}
          aria-label={`key ${index}`}
          className={styles.noBorder}
          placeholder="Add a key (optional)"
          value={key}
          data-prop="key"
          data-index={index}
          onChange={this.onChange}
          inputRef={ref}
        />
      </>
    );
  }

  private getTextFieldValue(key: string = '', value: string = '', index: number): ReactNode {
    return (
      <>
        <TextField
          inputContainerClassName={styles.kvInputValue}
          aria-label={`value ${index}`}
          className={styles.noBorder}
          placeholder="Add a value (optional)"
          disabled={!key || !key.trim()}
          value={value}
          data-prop="value"
          data-index={index}
          onChange={this.onChange}
        />
      </>
    );
  }

  private onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { index, prop } = event.target.dataset;
    const { kvPairs } = this.state;
    kvPairs[index][prop] = event.target.value;
    this.setState({ alert: '', kvPairs, numRows: kvPairs.length });

    this.props.onChange(this.pruneIncompletePairs(kvPairs));
  };

  private onAddKvPair = (): void => {
    const { kvPairs = [] } = this.state;
    const updatedPairs = [...kvPairs, { key: '', value: '' }];
    this.setState({ alert: '', kvPairs: updatedPairs, numRows: updatedPairs.length });
  };

  private onRemoveKvPair = (): void => {
    const { kvPairs = [] } = this.state;
    kvPairs.pop();
    this.setState({ alert: `Removed key value pair, row ${kvPairs.length}`, kvPairs, numRows: kvPairs.length });

    this.props.onChange(this.pruneIncompletePairs(kvPairs));
  };

  // trims off any incomplete pairs
  private pruneIncompletePairs(kvPairs: { key: string; value: string }[]): { [key: string]: string } {
    return kvPairs.reduce((kvPairs, kvPair) => {
      if (kvPair.key && kvPair.key.trim() && kvPair.value && kvPair.value.trim()) {
        kvPairs[kvPair.key] = kvPair.value;
      }
      return kvPairs;
    }, {} as any);
  }

  private get alert(): ReactNode {
    return (
      <span aria-live={'polite'} className={styles.alert}>
        {this.state.alert}
      </span>
    );
  }
}
