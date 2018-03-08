import * as DialogActions from '../action/dialogActions';

interface IDialogState {
  showing: boolean;
}

type IDialogAction = {
  type: 'DIALOG/SET_SHOWING';
  payload: boolean;
};

const DEFAULT_STATE: IDialogState = {
  showing: false
};

export default function dialog(state: IDialogState = DEFAULT_STATE, action: IDialogAction): IDialogState {
  switch(action.type) {
    case DialogActions.SET_SHOWING: {
      state = setShowing(action.payload, state);
      break;
    }

    default:
      break;
  }
  return state;
}

function setShowing(showing: boolean, state: IDialogState): IDialogState {
  return { showing: showing };
}
