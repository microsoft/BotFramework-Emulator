import { Checkbox, Colors, Fonts, PrimaryButton } from '@bfemulator/ui-react';
import { ILuisService } from 'msbot/bin/schema';
import { css } from 'glamor';
import * as React from 'react';
import { ChangeEvent, ChangeEventHandler, Component } from 'react';
import { LuisModel } from '../../../../../data/http/luisApi';

const luisModelViewerCss = css({
  boxSizing: 'border-box',
  width: '400px',
  height: '355px',
  color: '#333',
  background: '#f4f4f4',
  position: 'relative',

  '> header': {
    '> h3': {
      fontFamily: Fonts.FONT_FAMILY_DEFAULT,
      fontSize: '19px',
      fontWeight: 200,
      margin: 0,
      padding: '28px 24px 24px'
    }
  },

  '& .listContainer': {
    padding: '0 24px',

    '> p': {
      fontSize: '13px',
      margin: '0',
      paddingBottom: '20px'
    },

    ' > ul': {
      listStyle: 'none',
      margin: 0,
      padding: '5px 0 0 0',
      maxHeight: '96px',
      overflow:'auto',
      '> li': {
        padding: '1px 11px',
        backgroundColor: '#efefef',
        display: 'flex',
        '& span': {
          color: '#777',
          width: '100%',
          '&:last-child': {
            textAlign: 'right',
            width: '75%',
            paddingRight:'9px'
          }
        },
        '&:nth-child(odd)': {
          backgroundColor: 'white'
        },
      }
    }
  },

  '& .buttonGroup': {
    position: 'absolute',
    right: '24px',
    bottom: '32px',
    '> button:first-child': {
      marginRight: '8px'
    }
  },
  '& .selectAll': {
    padding: '5px 11px',
  },

  '& .checkboxOverride': {
    display: 'inline-block',
    width: '150px',
    '> label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '130px',
      display: 'inline-block'
    }
  }
});

const closeButtonCss = css({
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  margin: 0,
  padding: 0,
  position: 'absolute',
  right: '12px',
  top: '12px',
  width: '16px',
  height: '16px',
  '> svg': {
    fill: Colors.C3,
    '&:hover': {
      fill: Colors.C12
    }
  }
});

const smallHeaderCssOverrides = css({
  margin: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0
});

const mediumHeaderOverrides = css({});

const secondaryButton = css({
  backgroundColor: '#d4d4d4 !important',
  color: `${Colors.C0} !important`,
  '&:hover': {
    backgroundColor: `${Colors.C3} !important`,
    color: `${Colors.C4} !important`,
  },
  paddingRight: '4px'
});

interface LuisModelsViewerProps {
  luisServices: ILuisService[];
  luisModels: LuisModel[];
  addLuisModels: (models: LuisModel[]) => void;
  cancel: () => void
}

interface LuisModelsViewerState {
  [selectedLuisModelId: string]: LuisModel | false
}

export class LuisModelsViewer extends Component<LuisModelsViewerProps, LuisModelsViewerState> {
  public state: LuisModelsViewerState = {};

  constructor(props, context) {
    super(props, context);
  }

  public componentWillReceiveProps(nextProps = {} as any): void {
    const { luisServices = [] as ILuisService[] } = nextProps;

    const state = luisServices.reduce((agg, luisService: ILuisService) => {
      agg[luisService.appId] = luisService;
      return agg;
    }, {});

    this.setState(state);
  }

  public render(): JSX.Element {
    const { state, props } = this;
    const keys = Object.keys(state);
    const checkAllChecked = props.luisModels.reduce((isTrue, luisModel) => state[luisModel.id] && isTrue, !!keys.length);
    return (
      <section { ...luisModelViewerCss }>
        { this.sectionHeader }
        <div className="listContainer">
          <p>Selecting a LUIS app below will store the app ID in your bot file.</p>
          <div className="selectAll">
            <Checkbox onChange={ this.onSelectAllChange } checked={ checkAllChecked } id="select-all-luis-models" label="Select all"/>
          </div>
          <ul>
            { ...this.luisModelElements }
          </ul>
        </div>
        <div className="buttonGroup">
          <PrimaryButton text="Cancel" onClick={ this.onCancelClick } className={ secondaryButton.toString() }/>
          <PrimaryButton text="Add" onClick={ this.onAddClick }/>
        </div>
      </section>
    );
  }

  private get sectionHeader(): JSX.Element {
    return (
      <header>
        <button { ...closeButtonCss } onClick={ this.onCancelClick }>
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='1 1 16 16'>
            <g>
              <polygon points="14.1015625 2.6015625 8.7109375 8 14.1015625 13.3984375 13.3984375 14.1015625 8 8.7109375 2.6015625 14.1015625 1.8984375 13.3984375 7.2890625 8 1.8984375 2.6015625 2.6015625 1.8984375 8 7.2890625 13.3984375 1.8984375"/>
            </g>
          </svg>
        </button>
        <h3>Add LUIS apps</h3>
      </header>
    );
  }

  private get luisModelElements(): JSX.Element[] {
    const { state, onChange } = this;
    const { luisModels } = this.props;
    return luisModels.map(luisModel => {
      const { id, name: label, culture, activeVersion } = luisModel;
      const checkboxProps = {
        label,
        checked: !!state[id],
        id: `model${id}`,
        onChange: onChange.bind(this, luisModel)
      };
      return (
        <li key={ id }>
          <Checkbox { ...checkboxProps } className='checkboxOverride'/>
          <span>&nbsp;-&nbsp;version { activeVersion }</span>
          <span>{ culture }</span>
        </li>
      );
    });
  }

  private onChange(luisModel: LuisModel, event: ChangeEvent<any>) {
    const { target }: { target: HTMLInputElement } = event;
    this.setState({ [luisModel.id]: target.checked ? luisModel : false });
  }

  private onSelectAllChange: ChangeEventHandler<any> = (event: ChangeEvent<any>) => {
    const { luisModels = [] } = this.props as any;
    const { target }: { target: HTMLInputElement } = event;
    const newState = {};
    luisModels.forEach(luisModel => {
      newState[luisModel.id] = target.checked ? luisModel : false;
    });
    this.setState(newState);
  };

  private onAddClick: ChangeEventHandler<any> = (event: ChangeEvent<any>) => {
    const { state } = this;
    const addedModels: LuisModel[] = Object.keys(state).reduce((models, luisModelId) => {
      if (state[luisModelId]) {
        models.push(state[luisModelId]);
      }
      return models;
    }, []);
    this.props.addLuisModels(addedModels);
  };

  private onCancelClick: ChangeEventHandler<any> = (event: ChangeEvent<any>) => {
    this.props.cancel();
  };
}
