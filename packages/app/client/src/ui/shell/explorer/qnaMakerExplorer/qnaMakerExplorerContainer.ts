import { IQnAService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchQnaMakerEditor, openQnAMakerDeepLink, openQnaMakerExplorerContextMenu } from '../../../../data/action/qnaMakerServiceActions';
import { IRootState } from '../../../../data/store';
import { QnaMakerEditor } from './qnaMakerEditor/qnaMakerEditor';
import { QnaMakerExplorer } from './qnaMakerExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    qnaMakerServices: services.filter(service => service.type === ServiceType.QnA),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchQnaMakerEditor: (qnaMakerEditor: ComponentClass<QnaMakerEditor>, qnaMakerService: IQnAService) => dispatch(launchQnaMakerEditor(qnaMakerEditor, qnaMakerService)),
    openQnaMakerDeepLink: (qnaService: IQnAService) => dispatch(openQnAMakerDeepLink(qnaService)),
    openContextMenu: (qnaMakerService: IQnAService, qnaMakerEditor: ComponentClass<QnaMakerEditor>) => dispatch(openQnaMakerExplorerContextMenu(qnaMakerEditor, qnaMakerService)),
  };
};

export const QnaMakerExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QnaMakerExplorer) as any;
