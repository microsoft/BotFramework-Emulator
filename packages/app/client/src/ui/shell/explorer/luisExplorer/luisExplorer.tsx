import { Colors, ExpandCollapse, ExpandCollapseContent, ExpandCollapseControls } from '@bfemulator/ui-react';
import { css } from 'glamor';
import * as React from 'react';
import { Component, ComponentClass } from 'react';
import { LuisModel } from '../../../../data/http/luisApi';
import { LuisModelsViewerContainer } from './luisModelsViewerDialog';

const componentCss = css({
  position: 'relative',
  display: 'inline-block',
  height: '100%',
  width: '100%',
  '> button': {
    background: 'transparent',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    position: 'absolute',
    transform: 'translateY(-50%)',
    top: '50%',
    right: '10px',
    padding: '0',
    margin: '0',

    '&:hover': {},

    '> svg': {
      width: '12px',
      height: '12px',

      fill: Colors.C10,
      transition: 'fill .5s ease-out',
      '&:hover': {
        fill: Colors.C14
      }
    }
  }
});

const ulCss = css({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  '> li': {
    color: '#CCCCCC',
    cursor: 'pointer',
    display: 'block',
    whiteSpace: 'nowrap',
    lineHeight: '30px',
    height: '30px',
    paddingLeft: '13px',
    fontSize: ' 13px',

    '&::before': {
      content: '🔗',
      display: 'inline-block',
      color: Colors.C5,
      paddingRight: '5px'
    }
  }
});

interface LuisExplorerProps {
  addedLuisModels: LuisModel[];
  launchLuisModelsViewer: (viewer: ComponentClass<any>) => void;
}

export class LuisExplorer extends Component<LuisExplorerProps, {}> {
  public state = {} as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  public componentWillReceiveProps(newProps: LuisExplorerProps) {
    if (newProps.addedLuisModels !== this.props.addedLuisModels
      && newProps.addedLuisModels.length) {
      this.setState({ expanded: true });
    }
  }

  private get controls(): JSX.Element {
    return (
      <ExpandCollapseControls>
        <span {...componentCss}>
          <button onClick={this.onAddLuisModelClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
              <g>
                <path d="M0 10L10 10 10 0 15 0 15 10 25 10 25 15 15 15 15 25 10 25 10 15 0 15"/>
              </g>
            </svg>
          </button>
        </span>
      </ExpandCollapseControls>
    );
  }

  private get links() {
    const { addedLuisModels = [] } = this.props;
    return addedLuisModels
      .map((model, index) => {
        return <li key={index} onClick={this.onLinkClick.bind(this, model)}>{model.name}</li>;
      });
  }

  private get content(): JSX.Element {
    return (
      <ExpandCollapseContent>
        <ul {...ulCss}>
          {this.links}
        </ul>
      </ExpandCollapseContent>
    );
  }

  private onAddLuisModelClick = (): void => {
    this.props.launchLuisModelsViewer(LuisModelsViewerContainer);
  };

  private onLinkClick = (luisModel: LuisModel, event: MouseEvent) => {
    // const url = `https://${luisModel.}`
    // shell.openExternal();
  };

  public render(): JSX.Element {
    return (
      <ExpandCollapse key="LuisExplorer" title="LUIS" expanded={this.state.expanded}>
        {this.controls}
        {this.content}
      </ExpandCollapse>
    );
  }
}
