import * as React from 'react';
import { Component } from 'react';
import * as styles from './resourcesBar.scss';
import * as explorerStyles from '../explorerStyles.scss';
import { ResourceExplorerContainer } from '../resourceExplorer/resourceExplorerContainer';
import { IFileService } from 'msbot/bin/schema';

export interface ResourcesBarProps {
  chatFiles: IFileService[];
  transcripts: IFileService[];
}

export class ResourcesBar extends Component<ResourcesBarProps, ResourcesBarProps> {
  render() {
    return (
      <div className={ styles.resourcesBar }>
        <div className={ explorerStyles.explorerBarHeader }>
          <header>
            Resources
          </header>
        </div>
        <ul className={ explorerStyles.explorerSet }>
          <li>
            <ResourceExplorerContainer files={ this.props.chatFiles } title="Scripts"/>
            <ResourceExplorerContainer files={ this.props.transcripts } title="Transcripts"/>
          </li>
        </ul>
      </div>
    );
  }
}
