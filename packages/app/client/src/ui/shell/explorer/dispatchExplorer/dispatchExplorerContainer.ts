import { IDispatchService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchDispatchEditor, openDispatchDeepLink, openDispatchExplorerContextMenu } from '../../../../data/action/dispatchServiceActions';
import { IRootState } from '../../../../data/store';
import { DispatchEditor } from './dispatchEditor/dispatchEditor';
import { DispatchExplorer } from './dispatchExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    dispatchServices: services.filter(service => service.type === ServiceType.Dispatch),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchDispatchEditor: (dispatchEditor: ComponentClass<DispatchEditor>, dispatchService: IDispatchService) => dispatch(launchDispatchEditor(dispatchEditor, dispatchService)),
    openDispatchDeepLink: (dispatchService: IDispatchService) => dispatch(openDispatchDeepLink(dispatchService)),
    openContextMenu: (dispatchService: IDispatchService, dispatchEditor: ComponentClass<DispatchEditor>) => dispatch(openDispatchExplorerContextMenu(dispatchEditor, dispatchService)),
  };
};

export const DispatchExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DispatchExplorer) as any;
