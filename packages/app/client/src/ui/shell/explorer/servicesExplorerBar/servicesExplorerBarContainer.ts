import { connect } from 'react-redux';
import { IRootState } from '../../../../data/store';
import ServicesExplorerBar from './servicesExporerBar';

const mapStateToProps = (state: IRootState) => {
  const activeBotExists = !!state.bot.activeBot;
  return { activeBotExists };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export const ServicesExplorerBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesExplorerBar) as any;
