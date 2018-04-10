import { Checkbox, PrimaryButton, SmallHeader } from '@bfemulator/ui-react';
import { css } from 'glamor';
import * as React from 'react';
import { ChangeEvent, ChangeEventHandler, Component } from 'react';
import { LuisModel } from '../../../../../data/http/luisApi';
import { Colors } from '@bfemulator/ui-react';

const luisModelViewerCss = css({
  width: '350px',
  background: 'black',
  border: `1px solid ${Colors.C0}`,

  '> header': {
    background: Colors.C12,
    padding: '5px',
    position: 'relative',

    '> button': {
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      margin: 0,
      padding: 0,
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      '> svg': {
        fill: Colors.C4,
        transition: 'fill .5s ease-out',
        '&:hover': {
          fill: Colors.C12
        }
      }
    }
  },

  '> div': {
    padding: '15px',
    'input[type="checkbox"]': {},

    ' > ul': {
      listStyle: 'none',
      margin: 0,
      padding: '15px 0',
      '> li:nth-child(odd)': {
        backgroundColor: 'rgba(0, 99, 177, .34)'
      }
    }
  },
});

const smallHeaderCssOverrides = css({
  margin: 0
});

const mediumHeaderOverrides = css({});

interface LuisModelProps {
  selectedLuisModels: LuisModel[];
  availableLuisModels: LuisModel[];
  addLuisModels: (models: LuisModel[]) => void;
}

interface LuisModelsViewerState {
  [selectedLuisModelId: string]: LuisModel | false
}

export class LuisModelsViewer extends Component<LuisModelProps, {}> {
  public state: LuisModelsViewerState = {};

  constructor(props, context) {
    super(props, context);
  }

  public componentWillReceiveProps(nextProps = {} as any): void {
    const { selectedLuisModels = [] as LuisModel[] } = nextProps;

    const state = selectedLuisModels.reduce((agg, luisModel) => {
      agg[luisModel.id] = luisModel;
    }, {});

    this.setState(state);
  }

  public render(): JSX.Element {
    const { state } = this;
    const keys = Object.keys(state);
    const checkAllChecked = keys.reduce((isTrue, key) => state[key] && isTrue, !!keys.length);
    return (
      <section {...luisModelViewerCss}>
        {this.sectionHeader}
        <div>
          <SmallHeader className={smallHeaderCssOverrides.toString()}>Link to these LUIS apps</SmallHeader>
          <Checkbox onChange={this.onSelectAllChange} checked={checkAllChecked} id="select-all-luis-models"
                    label="Select all"/>
          <ul>
            {...this.luisModelElements}
          </ul>
        </div>
        <PrimaryButton text="add" onClick={this.onAddClick}/>
      </section>
    );
  }

  private get sectionHeader(): JSX.Element {
    return (
      <header>
        <SmallHeader className={smallHeaderCssOverrides.toString()}>Select Services</SmallHeader>
        <button>
          <svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='3 3 16 16'>
            <g>
              <path
                d='M12.597 11.042l2.803 2.803-1.556 1.555-2.802-2.802L8.239 15.4l-1.556-1.555 2.802-2.803-2.802-2.803 1.555-1.556 2.804 2.803 2.803-2.803L15.4 8.239z'/>
            </g>
          </svg>
        </button>
      </header>
    );
  }

  private get luisModelElements(): JSX.Element[] {
    const { state, onChange, props } = this;
    const { availableLuisModels } = props;
    return availableLuisModels.map(luisModel => {
      const { id, name: label, culture } = luisModel;
      const checkboxProps = {
        label,
        checked: !!state[id],
        id: `model${id}`,
        onChange: onChange.bind(this, luisModel)
      };
      return (
        <li key={id}>
          <div>
            <Checkbox {...checkboxProps}/>
          </div>
          <span>{culture}</span>
        </li>
      );
    });
  }

  private onChange(luisModel: LuisModel, event: ChangeEvent<any>) {
    const { target }: { target: HTMLInputElement } = event;
    this.setState({ [luisModel.id]: target.checked ? luisModel : false });
  }

  private onSelectAllChange: ChangeEventHandler<any> = (event: ChangeEvent<any>) => {
    const { availableLuisModels } = this.props;
    const { target }: { target: HTMLInputElement } = event;
    const newState = {};
    availableLuisModels.forEach(luisModel => {
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
}
