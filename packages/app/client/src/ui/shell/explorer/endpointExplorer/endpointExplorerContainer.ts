import { ServiceType } from '@bfemulator/sdk-shared';
import { connect } from 'react-redux';
import { openEndpointExplorerContextMenu } from '../../../../data/action/endpointActions';
import { IRootState } from '../../../../data/store';
import { EndpointExplorer } from './endpointExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    services: services.filter(service => service.type === ServiceType.Endpoint),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openContextMenu: endpointService => dispatch(openEndpointExplorerContextMenu(endpointService))
  };
};

export const EndpointExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EndpointExplorer) as any;
