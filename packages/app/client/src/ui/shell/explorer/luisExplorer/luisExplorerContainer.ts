import { ILuisService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchLuisEditor, openLuisDeepLink, openLuisExplorerContextMenu } from '../../../../data/action/luisServiceActions';
import { IRootState } from '../../../../data/store';
import { LuisEditor } from './luisEditor/luisEditor';
import { LuisExplorer } from './luisExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    luisServices: services.filter(service => service.type === ServiceType.Luis),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchLuisEditor: (luisEditor: ComponentClass<LuisEditor>, luisService: ILuisService) => dispatch(launchLuisEditor(luisEditor, luisService)),
    openLuisDeepLink: (luisService: ILuisService) => dispatch(openLuisDeepLink(luisService)),
    openContextMenu: (luisService: ILuisService, luisEditor: ComponentClass<LuisEditor>) => dispatch(openLuisExplorerContextMenu(luisEditor, luisService)),
  };
};

export const LuisExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisExplorer) as any;
