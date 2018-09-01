import * as React from 'react';
import { Component, ComponentClass } from 'react';
import * as styles from './resourcesBar.scss';
import * as explorerStyles from '../explorerStyles.scss';
import { ResourceExplorerContainer } from '../resourceExplorer/resourceExplorerContainer';
import { IFileService } from 'botframework-config/lib/schema';
import { ResourcesSettingsContainer } from '../../../dialogs';

export interface ResourcesBarProps {
  chatFiles: IFileService[];
  transcripts: IFileService[];
  isBotActive: boolean;
  openResourcesSettings: (payload: { dialog: ComponentClass<any> }) => void;
}

export class ResourcesBar extends Component<ResourcesBarProps, ResourcesBarProps> {
  render() {
    return (
      <div className={ styles.resourcesBar }>
        <div className={ explorerStyles.explorerBarHeader }>
          <header>
            Resources
          </header>
          <button
            className={ explorerStyles.botSettings }
            disabled={ !this.props.isBotActive }
            onClick={ this.onSettingsClick }/>
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

  private onSettingsClick = (): void => {
    this.props.openResourcesSettings({ dialog: ResourcesSettingsContainer });
  }
}
