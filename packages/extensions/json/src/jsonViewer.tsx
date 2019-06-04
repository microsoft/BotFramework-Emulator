import * as React from 'react';
import { Component } from 'react';
import ReactJson from 'react-json-view';
import { WindowHostReceiver } from './windowHostReceiver';
import './index.scss';

const themeNameToViewerThemeName = {
  light: 'shapeshifter:inverted',
  dark: 'shapeshifter',
  'high-contrast': 'bright',
};

export interface JsonViewerState {
  data: any;
  themeName: string;
}

export class JsonViewer extends Component<{}, JsonViewerState> {
  constructor(props: any) {
    super(props);
    new WindowHostReceiver(this);
  }

  public render() {
    const state = this.state || ({ data: {} } as any);
    const { data, themeName = 'light' } = state;
    return (
      <ReactJson
        displayDataTypes={false}
        displayObjectSize={false}
        src={data}
        enableClipboard={false}
        theme={themeNameToViewerThemeName[themeName]}
        style={{ backgroundColor: 'transparent' }}
        name={false}
      />
    );
  }

  public setData(data: any): void {
    this.setState({ data });
  }

  public setTheme(themeName: string) {
    this.setState({ themeName });
  }
}
