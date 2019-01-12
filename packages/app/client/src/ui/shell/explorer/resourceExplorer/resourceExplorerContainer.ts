import { IFileService } from "botframework-config/lib/schema";
import { ComponentClass } from "react";
import { connect } from "react-redux";

import {
  openContextMenuForResource,
  openResource,
  openResourcesSettings,
  renameResource
} from "../../../../data/action/resourcesAction";
import { RootState } from "../../../../data/store";

import { ResourceExplorer, ResourceExplorerProps } from "./resourceExplorer";

const mapStateToProps = (
  state: RootState,
  ownProps: ResourceExplorerProps
): ResourceExplorerProps => ({
  fileToRename: state.resources.resourceToRename,
  ...ownProps
});

const mapDispatchToProps = (
  dispatch: (...args: any[]) => void
): ResourceExplorerProps => ({
  openContextMenuForService: (resource: IFileService) =>
    dispatch(openContextMenuForResource(resource)),
  renameResource: resource => dispatch(renameResource(resource)),
  openResource: resource => dispatch(openResource(resource)),
  openResourcesSettings: (dialog: ComponentClass<any>) =>
    dispatch(openResourcesSettings({ dialog })),
  window
});

export const ResourceExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceExplorer);
