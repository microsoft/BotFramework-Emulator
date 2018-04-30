import { IEndpointService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchEndpointEditor, openEndpointDeepLink, openEndpointExplorerContextMenu } from '../../../../data/action/endpointServiceActions';
import { IRootState } from '../../../../data/store';
import { EndpointEditor } from './endpointEditor/endpointEditor';
import { EndpointExplorer } from './endpointExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    endpointServices: services.filter(service => service.type === ServiceType.Endpoint),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchEndpointEditor: (endpointEditor: ComponentClass<EndpointEditor>, endpointService: IEndpointService) => dispatch(launchEndpointEditor(endpointEditor, endpointService)),
    openEndpointDeepLink: (endpointService: IEndpointService) => dispatch(openEndpointDeepLink(endpointService)),
    openContextMenu: (endpointService: IEndpointService, endpointEditor: ComponentClass<EndpointEditor>) => dispatch(openEndpointExplorerContextMenu(endpointEditor, endpointService)),
  };
};

export const EndpointExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EndpointExplorer) as any;
