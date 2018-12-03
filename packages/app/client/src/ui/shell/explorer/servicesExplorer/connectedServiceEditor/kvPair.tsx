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
  kvPairs: { key: string, value: string }[];
}

export class KvPair extends Component<KvPairProps, KvPairState> {

  public static getDerivedStateFromProps(nextProps: KvPairProps, prevState: KvPairState): KvPairState {
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
        length: kvPairsKeys.length
      } as KvPairState;
    }

    return prevState;
  }

  constructor(props: KvPairProps = {} as KvPairProps) {
    super(props);
    this.state = KvPair.getDerivedStateFromProps(props, null);
  }

  public render(): ReactNode {
    const { length, kvPairs } = this.state;
    let numEmptyRows = 1 + length - kvPairs.length;
    const rows = [];

    for (let i = 0; i < numEmptyRows; i++) {
      rows.push(
        <li key={ kvPairs.length + i }>
          { this.getTextFieldPair() }
        </li>);
    }

    kvPairs.forEach((kvPair, index) => {
      rows.push(
        <li key={ index }>
          { this.getTextFieldPair(kvPair.key, kvPair.value) }
        </li>);
    });

    return (
      <div>
        <header className={ styles.header }>
          <span>Key</span>
          <span>Value</span>
        </header>
        <ul className={ styles.kvPairContainer }>
          { rows }
        </ul>
        <button
          className={ styles.addKvPairButton }
          onClick={ this.onAddKvPairClick }>
          Add a key-value pair
        </button>
      </div>
    );
  }

  private getTextFieldPair(key: string = '', value: string = ''): ReactNode {
    return (
      <>
        <TextField
          className={ styles.noBorder }
          placeholder="Add a key (optional)"
          value={ key }
          data-prop="key"
          onChange={ this.onChange }/>
        <TextField
          className={ styles.noBorder }
          placeholder="Add a value (optional)"
          disabled={ !key || !key.trim() }
          value={ value }
          data-prop="value"
          onChange={ this.onChange }/>
      </>
    );
  }

  private onAddKvPairClick = (): void => {
    this.setState({ length: this.state.length + 1 });
  }

  private onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { target } = event;
    const { prop } = target.dataset;
    const targetLi = target.parentElement.parentElement as HTMLOListElement;
    const index = Array.prototype.findIndex.call(targetLi.parentElement.children, li => li === targetLi);
    const { kvPairs } = this.state;
    if (!kvPairs[index]) {
      kvPairs[index] = { key: '', value: '' };
    }
    kvPairs[index][prop] = (target as HTMLInputElement).value;
    this.setState({ kvPairs: [...kvPairs], length: kvPairs.length });

    this.props.onChange(kvPairs.reduce((kvPairMap, kvPair) => {
      if (kvPair.key && kvPair.key.trim()) {
        kvPairMap[kvPair.key] = kvPair.value;
      }
      return kvPairMap;
    }, {}));
  }
}
