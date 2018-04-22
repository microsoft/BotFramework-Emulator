import { ServiceType } from '@bfemulator/sdk-shared';
import { connect } from 'react-redux';
import { openDispatchDeepLink, openDispatchExplorerContextMenu } from '../../../../data/action/dispatchServiceActions';
import { IRootState } from '../../../../data/store';
import { LuisExplorer } from './luisExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    services: services.filter(service => service.type === ServiceType.Dispatch),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openDeepLink: dispatchService => dispatch(openDispatchDeepLink(dispatchService)),
    openContextMenu: dispatchService => dispatch(openDispatchExplorerContextMenu(dispatchService))
  };
};

export const DispatchExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisExplorer) as any;
