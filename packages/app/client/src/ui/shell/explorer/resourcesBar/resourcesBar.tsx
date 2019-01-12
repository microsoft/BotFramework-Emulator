import { IFileService } from "botframework-config/lib/schema";
import * as React from "react";
import { Component } from "react";

import * as explorerStyles from "../explorerStyles.scss";
import { ResourceExplorerContainer } from "../resourceExplorer/resourceExplorerContainer";

import * as styles from "./resourcesBar.scss";

export interface ResourcesBarProps {
  chatFiles: IFileService[];
  chatsPath: string;
  transcripts: IFileService[];
  transcriptsPath: string;
}

export class ResourcesBar extends Component<
  ResourcesBarProps,
  ResourcesBarProps
> {
  public render() {
    return (
      <div className={styles.resourcesBar}>
        <div className={explorerStyles.explorerBarHeader}>
          <header>Resources</header>
        </div>
        <ul className={explorerStyles.explorerSet}>
          <li>
            <ResourceExplorerContainer
              files={this.props.chatFiles}
              resourcesPath={this.props.chatsPath}
              title="chat files"
              ariaLabel="chat files"
            />
            <ResourceExplorerContainer
              files={this.props.transcripts}
              resourcesPath={this.props.transcriptsPath}
              title="transcripts"
              ariaLabel="transcripts"
            />
          </li>
        </ul>
      </div>
    );
  }
}
