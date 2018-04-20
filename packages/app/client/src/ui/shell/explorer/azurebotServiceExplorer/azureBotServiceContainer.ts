import { ServiceType } from '@bfemulator/sdk-shared';
import { connect } from 'react-redux';
import { openEndpointExplorerContextMenu } from '../../../../data/action/endpointActions';
import { IRootState } from '../../../../data/store';
import { AzureBotServiceExplorer } from './azureBotService';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    services: services.filter(service => service.type === ServiceType.AzureBotService),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openContextMenu: azureBotService => dispatch(openEndpointExplorerContextMenu(azureBotService))
  };
};

export const AzureBotServiceExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AzureBotServiceExplorer) as any;
