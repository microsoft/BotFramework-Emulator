import { IFileService } from "botframework-config/lib/schema";
import * as React from "react";
import { ChangeEvent, ComponentClass, KeyboardEvent, MouseEvent } from "react";

import { ResourcesSettingsContainer } from "../../../dialogs";
import {
  ServicePane,
  ServicePaneProps,
  ServicePaneState
} from "../servicePane/servicePane";

import * as styles from "./resourceExplorer.scss";

function simpleNameSort(a: IFileService, b: IFileService): 0 | 1 | -1 {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export interface ResourceExplorerState extends ServicePaneState {
  fileToRename?: IFileService;
}

export interface ResourceExplorerProps
  extends ServicePaneProps,
    ResourceExplorerState {
  files?: IFileService[];
  renameResource: (resource: IFileService) => void;
  openResource: (resource: IFileService) => void;
  resourcesPath?: string;
  openResourcesSettings?: (dialog: ComponentClass<any>) => void;
}

export class ResourceExplorer extends ServicePane<
  ResourceExplorerProps,
  ResourceExplorerState
> {
  public static getDerivedStateFromProps(newProps: ResourceExplorerProps) {
    const { fileToRename = {} } = newProps;
    return { fileToRename: { ...fileToRename } }; // Copies only
  }

  protected get controls(): JSX.Element {
    return null;
  }

  protected get links() {
    const { files = [] } = this.props;
    const fileToRename = this.state.fileToRename || { id: "", name: "" };
    return files.sort(simpleNameSort).map((file, index) => {
      const mutable = fileToRename.id === file.id;
      if (!mutable) {
        return (
          <li
            className={styles.link}
            data-index={index}
            key={`file_${index}`}
            onClick={this.onLinkClick}
            onKeyPress={this.onLinkKeyPress}
            tabIndex={0}
            title={file.path}
          >
            {file.name}
          </li>
        );
      }

      return (
        <li key={`file_${index}`} className={styles.link}>
          <input
            defaultValue={fileToRename.name}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
            onKeyUp={this.onInputKeyUp}
            type="text"
            ref={this.editableInputRef}
          />
        </li>
      );
    });
  }

  protected onLinkKeyPress = (e): void => {
    if (e.key === "Enter") {
      this.onLinkClick(e);
    }
  };

  protected onLinkClick = (event: MouseEvent<HTMLLIElement>) => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: fileService } = this.props.files;
    this.props.openResource(fileService);
  };

  protected onSortClick = () => {
    // unimplemented as of now
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement): void {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: fileService } = this.props.files;
    this.props.openContextMenuForService(fileService);
  }

  protected get emptyContent(): JSX.Element {
    return (
      <>
        <p className={styles.emptyContent}>
          You do not have any {this.props.title} in{" "}
          <strong>{this.props.resourcesPath}.</strong>
        </p>
        {this.additionalContent}
      </>
    );
  }

  protected get additionalContent(): JSX.Element {
    return (
      <p className={styles.emptyContent}>
        <a href="javascript:void(0);" onClick={this.onChooseLocationClick}>
          <strong>Choose a different location.</strong>
        </a>
      </p>
    );
  }

  private onChooseLocationClick = () => {
    this.props.openResourcesSettings(ResourcesSettingsContainer);
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { fileToRename } = this.state;
    fileToRename.name = event.target.value;
  };

  private onInputBlur = (): void => {
    this.props.renameResource(this.state.fileToRename);
  };

  private onInputKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.which !== 13) {
      return;
    }
    const { fileToRename } = this.state;
    this.props.renameResource(fileToRename);
  };

  private editableInputRef = (ref: HTMLInputElement): void => {
    if (ref) {
      requestAnimationFrame(() => {
        const { value } = ref;
        const lastDotIndex = (value || "").lastIndexOf(".");
        ref.focus();
        ref.setSelectionRange(0, lastDotIndex);
      });
    }
  };
}
