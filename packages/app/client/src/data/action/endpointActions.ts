import { IEndpointService } from 'msbot/bin/schema';
import { Action } from 'redux';

export const OPEN_ENDPOINT_EXPLORER_CONTEXT_MENU = 'OPEN_ENDPOINT_EXPLORER_CONTEXT_MENU';

export interface EndpointServiceAction<T> extends Action {
  payload: T;
}

export interface EndpointServicePayload {
  endpointService?: IEndpointService;
}

export function openEndpointExplorerContextMenu(endpointService: IEndpointService): EndpointServiceAction<EndpointServicePayload> {
  return {
    type: OPEN_ENDPOINT_EXPLORER_CONTEXT_MENU,
    payload: { endpointService }
  };
}
