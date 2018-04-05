import * as PresentationActions from '../action/presentationActions';
import { PresentationAction } from '../action/presentationActions';
import { CommandService } from '../../platform/commands/commandService';

export interface IPresentationState {
  enabled: boolean;
}

const DEFAULT_STATE: IPresentationState = {
  enabled: false
};

export default function presentation(state: IPresentationState = DEFAULT_STATE, action: PresentationAction): IPresentationState {
  switch (action.type) {
    case PresentationActions.DISABLE:
      state = setEnabled(false, state);
      break;

    case PresentationActions.ENABLE:
      state = setEnabled(true, state);
      break;

    default:
      break;
  }

  return state;
}

function setEnabled(enabled: boolean, state: IPresentationState): IPresentationState {
  let newState = Object.assign({}, state);
  newState.enabled = enabled;

  CommandService.remoteCall('electron:set-fullscreen', enabled);

  return newState;
}
