import { connect } from 'react-redux';
import { RootState } from '../../../../../data/store';
import { Inspector } from './inspector';

const mapStateToProps = (state: RootState, ownProps: any) => ({
  ...ownProps,
  botHash: state.bot.activeBotDigest,
  activeBot: state.bot.activeBot,
  themeInfo: state.theme
});

export const InspectorContainer = connect(mapStateToProps, null)(Inspector);
