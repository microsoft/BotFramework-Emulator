import { connect } from 'react-redux';
import { RootState } from '../../../../data/store';
import { ResourcesBar, ResourcesBarProps } from './resourcesBar';
import { openResourcesSettings } from '../../../../data/action/resourcesAction';
import { ComponentClass } from 'react';

const mapStateToProps = (state: RootState, ownProps: ResourcesBarProps): ResourcesBarProps => ({
  chatFiles: state.resources.chats,
  transcripts: state.resources.transcripts,
  isBotActive: !!state.bot.activeBot,
  ...ownProps
});

const mapDispatchToProps = dispatch => ({
  openResourcesSettings: (payload: { dialog: ComponentClass<any> }) => dispatch(openResourcesSettings(payload))
});

export const ResourcesBarContainer = connect(mapStateToProps, mapDispatchToProps)(ResourcesBar);
