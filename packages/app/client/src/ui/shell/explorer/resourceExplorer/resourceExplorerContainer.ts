import { connect } from 'react-redux';
import { IFileService } from 'msbot/bin/schema';
import { ResourceExplorer, ResourceExplorerProps } from './resourceExplorer';
import { RootState } from '../../../../data/store';
import { openContextMenuForResource, openResource, renameResource } from '../../../../data/action/resourcesAction';

const mapStateToProps = (state: RootState, ownProps: ResourceExplorerProps): ResourceExplorerProps => ({
  fileToRename: state.resources.resourceToRename,
  ...ownProps
});

const mapDispatchToProps = (dispatch): ResourceExplorerProps => ({
  openContextMenuForService: (resource: IFileService) => dispatch(openContextMenuForResource(resource)),
  renameResource: resource => dispatch(renameResource(resource)),
  openResource: resource => dispatch(openResource(resource)),
  window
});

export const ResourceExplorerContainer = connect(mapStateToProps, mapDispatchToProps)(ResourceExplorer);
