import { IAzureBotService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchAzureBotServiceEditor, openAzureBotServiceDeepLink, openAzureBotServiceExplorerContextMenu } from '../../../../data/action/azureBotServiceActions';
import { IRootState } from '../../../../data/store';
import { AzureBotServiceEditor } from './azureBotServiceEditor/azureBotServiceEditor';
import { AzureBotServiceExplorer } from './azureBotServiceExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    azureBotServices: services.filter(service => service.type === ServiceType.AzureBotService),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchAzureBotServiceEditor: (azureBotServiceEditor: ComponentClass<AzureBotServiceEditor>, azureBotService: IAzureBotService) => dispatch(launchAzureBotServiceEditor(azureBotServiceEditor, azureBotService)),
    openAzureBotServiceDeepLink: (azureBotService: IAzureBotService) => dispatch(openAzureBotServiceDeepLink(azureBotService)),
    openContextMenu: (azureBotService: IAzureBotService, azureBotServiceEditor: ComponentClass<AzureBotServiceEditor>) => dispatch(openAzureBotServiceExplorerContextMenu(azureBotServiceEditor, azureBotService)),
  };
};

export const AzureBotServiceExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AzureBotServiceExplorer) as any;
