import * as React from 'react';
import { UpdateActions } from '../reducers';
import * as Electron from 'electron';
import { UpdateStatus } from '../../types/updateStatus';

export interface UpdateDialogProps {
  showing?: boolean;
  version?: string;
}

export interface UpdateDialogState {
  openAfterInstallation: boolean;
  progress: string;
  status: UpdateStatus;
}

export class UpdateDialog extends React.Component<UpdateDialogProps, UpdateDialogState> {
  constructor(props: UpdateDialogProps) {
    super(props);

    Electron.ipcRenderer.on('update-progress', (event, progress: string) => {
      this.setState({ progress });
    })
    
    Electron.ipcRenderer.on('update-status', (event, status: UpdateStatus) => {
      this.setState({ status });
    });

    this.state = {
      openAfterInstallation: false,
      progress: '0%',
      status: null
    };
  }

  public render(): JSX.Element {
    if (this.props.showing) {
      return (
        <div>
          <div className="update-dialog-bg"></div>
          { this.content }
        </div>
      );
    } else {
      return null;
    }
  }

  public get content(): JSX.Element {
    switch (this.state.status) {
      case UpdateStatus.downloading:
        return this.props.showing && this.downloadView;
      case UpdateStatus.downloaded:
        return this.props.showing && this.postDownloadView;
      default:
        return this.defaultView;
    }
  }

  public get defaultView(): JSX.Element {
    return (
      <div className="update-dialog">
        <button className="update-dialog-close-icon" onClick={ this.onClickCancel }></button>
        <h1 className="update-dialog-header">A new version of the Bot Framework Emulator is available</h1>
        <p className="update-dialog-content">
          Bot Framework Emulator { this.props.version || '' } is available. Would you like to install the new version?
          &nbsp;
          <a href="https://aka.ms/botemulator">Learn more about Emulator v4.</a>
        </p>
        <div className="input-group appsettings-checkbox-group">
          <label className="form-label clickable">
              <input
                  type="checkbox"
                  name="openAfterInstallation"
                  className="form-input"
                  checked={ this.state.openAfterInstallation }
                  onChange={ this.onCheckOpenAfterInstallation }
              />
              Open Emulator v4 when installation is complete.
          </label>
        </div>
        <div className="update-dialog-btn-row">
          <button className="update-dialog-gray-btn" onClick={ this.onClickCancel }>Cancel</button>
          <button className="update-dialog-blue-btn" onClick={ this.onClickInstall }>Install the new version</button>
        </div>
      </div>
    );
  }

  public get downloadView(): JSX.Element {
    return (
      <div className="update-dialog">
      <button className="update-dialog-close-icon" onClick={ this.onClickCancel }></button>
        <h1 className="update-dialog-progress-header">Downloading ...</h1>
        { this.progressBar }
        <div className="update-dialog-btn-row">
          <button className="update-dialog-gray-btn" onClick={ this.onClickCancel }>Cancel download</button>
        </div>
      </div>
    );
  }

  public get postDownloadView(): JSX.Element {
    return (
      <div className="update-dialog">
      <button className="update-dialog-close-icon" onClick={ this.onClickCancel }></button>
        <button className="update-dialog-close-icon"></button>
        <h1 className="update-dialog-header">Download complete</h1>
        <p className="update-dialog-content">
          Would you like to migrate your bots and install Bot Framework Emulator v4?
        </p>
        <div className="update-dialog-btn-row">
          <button className="update-dialog-gray-btn" onClick={ this.onClickCancel }>No, thanks</button>
          <button className="update-dialog-blue-btn" onClick={ this.onClickMigrate }>Migrate and open</button>
        </div>
      </div>
    );
  }

  public get progressBar(): JSX.Element {
    let { progress = '0%' } = this.state;

    return (
      <div className="update-progress-track">
        <div className="update-progress-bar" style={{ width: progress }}></div>
      </div>
    );
  }

  private onCheckOpenAfterInstallation = () => {
    this.setState({ openAfterInstallation: !this.state.openAfterInstallation });
  };

  private onClickCancel = () => {
    UpdateActions.setShowing(false);
  }

  private onClickInstall = () => {
    // tell server side to download
    Electron.ipcRenderer.send('download-v4-update');
  }

  private onClickMigrate = () => {
    // tell server side to migrate and restart
    const openAfterInstall = this.state.openAfterInstallation;
    Electron.ipcRenderer.send('migrate-and-restart', openAfterInstall);
    UpdateActions.setShowing(false);
  }
}