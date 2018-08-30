import { connect } from 'react-redux';
import { RootState } from '../../../../data/store';
import { ResourcesBar, ResourcesBarProps } from './resourcesBar';

const mapStateToProps = (state: RootState, ownProps: ResourcesBarProps): ResourcesBarProps => ({
  chatFiles: state.resources.chats,
  transcripts: state.resources.transcripts
});

export const ResourcesBarContainer = connect(mapStateToProps)(ResourcesBar);
