import * as ExplorerActions from '../action/explorerActions';

type ExplorerAction = {
  type: 'EXPLORER/SHOW',
  payload: {
    show: boolean
  }
};

export interface IExplorerState {
  showing: boolean;
}

const DEFAULT_STATE: IExplorerState = {
  showing: true
};

export default function explorer(state: IExplorerState = DEFAULT_STATE, action: ExplorerAction): IExplorerState {
  switch (action.type) {
    case ExplorerActions.SHOW: {
      state = setShowing(action.payload.show, state);
      break;
    }

    default:
      break;
  }
  return state;
}

function setShowing(showing: boolean, state: IExplorerState): IExplorerState {
  let newState = Object.assign({}, state);

  newState.showing = showing;
  return newState;
}
