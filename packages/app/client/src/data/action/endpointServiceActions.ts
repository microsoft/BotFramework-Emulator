import { IEndpointService } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { EndpointEditor } from '../../ui/shell/explorer/endpointExplorer/endpointEditor/endpointEditor';

export const OPEN_ENDPOINT_DEEP_LINK = 'OPEN_ENDPOINT_DEEP_LINK';
export const OPEN_ENDPOINT_CONTEXT_MENU = 'OPEN_ENDPOINT_CONTEXT_MENU';
export const LAUNCH_ENDPOINT_EDITOR = 'LAUNCH_ENDPOINT_EDITOR';

export interface EndpointServiceAction<T> extends Action {
  payload: T;
}

export interface EndpointServicePayload {
  endpointService: IEndpointService;
}

export interface EndpointEditorPayload extends EndpointServicePayload {
  endpointEditorComponent?: ComponentClass<EndpointEditor>,
}

export function launchEndpointEditor(endpointEditorComponent: ComponentClass<EndpointEditor>, endpointService?: IEndpointService): EndpointServiceAction<EndpointEditorPayload> {
  return {
    type: LAUNCH_ENDPOINT_EDITOR,
    payload: { endpointEditorComponent, endpointService }
  };
}

export function openEndpointDeepLink(endpointService: IEndpointService): EndpointServiceAction<EndpointServicePayload> {
  return {
    type: OPEN_ENDPOINT_DEEP_LINK,
    payload: { endpointService }
  };
}

export function openEndpointExplorerContextMenu(endpointEditorComponent: ComponentClass<EndpointEditor>, endpointService?: IEndpointService): EndpointServiceAction<EndpointEditorPayload> {
  return {
    type: OPEN_ENDPOINT_CONTEXT_MENU,
    payload: { endpointEditorComponent, endpointService }
  };
}
