import { IQnAService, ServiceType } from '@bfemulator/sdk-shared';
import { connect } from 'react-redux';
import { openQnAMakerDeepLink, openQnaMakerExplorerContextMenu } from '../../../../data/action/qnaMakerServiceActions';
import { IRootState } from '../../../../data/store';
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
    openQnaMakerDeepLink: (qnaService: IQnAService) => dispatch(openQnAMakerDeepLink(qnaService)),
    openContextMenu: (qnaService: IQnAService) => dispatch(openQnaMakerExplorerContextMenu(qnaService)),
  };
};

export const QnaMakerExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QnaMakerExplorer) as any;
