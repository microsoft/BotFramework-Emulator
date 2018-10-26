import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { IFileService } from 'botframework-config/lib/schema';
import { ResourceExplorer, ResourceExplorerProps } from './resourceExplorer';
import { RootState } from '../../../../data/store';
import {
  openContextMenuForResource,
  openResource,
  openResourcesSettings,
  renameResource
} from '../../../../data/action/resourcesAction';

const mapStateToProps = (state: RootState, ownProps: ResourceExplorerProps): ResourceExplorerProps => ({
  fileToRename: state.resources.resourceToRename,
  ...ownProps
});

const mapDispatchToProps = (dispatch: (...args: any[]) => void): ResourceExplorerProps => ({
    openContextMenuForService: (resource: IFileService) => dispatch(openContextMenuForResource(resource)),
    renameResource: resource => dispatch(renameResource(resource)),
    openResource: resource => dispatch(openResource(resource)),
    openResourcesSettings: (dialog: ComponentClass<any>) => dispatch(openResourcesSettings({ dialog })),
    window
  })
;

export const ResourceExplorerContainer = connect(mapStateToProps, mapDispatchToProps)(ResourceExplorer);
