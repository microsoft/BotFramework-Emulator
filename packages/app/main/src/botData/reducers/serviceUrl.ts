import { AnyAction } from 'redux';

export function serviceUrlReducer(state: string = '', action: AnyAction): string {
  switch (action.type) {
    case 'updateServiceUrl':
      return action.payload;

    default:
      return state;
  }
}
