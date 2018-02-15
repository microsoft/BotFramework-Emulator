

import { IBotState } from './reducer/bot';


export interface IState {
  bot: IBotState;
}

export const DEFAULT_STATE: IState = {
  bot: {
    activeBot: null,
    bots: []
  }
};
