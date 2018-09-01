import * as React from 'react';
import { Component, MouseEvent } from 'react';
import { BotInfo } from '@bfemulator/app-shared';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import * as styles from './resourcesSettings.scss';

export interface ResourcesSettingsState {
  transcriptsPath?: string;
  chatsPath?: string;
  transcriptsInputError?: string;
  saveDisabled?: boolean;
  dirty?: boolean;
  path?: string;
}

export interface ResourcesSettingsProps extends ResourcesSettingsState {
  cancel: () => void;
  save: (settings: BotInfo) => void;
  showOpenDialog: () => Promise<any>;
}

export class ResourcesSettings extends Component<ResourcesSettingsProps, ResourcesSettingsState> {
  constructor(props: ResourcesSettingsProps, context: ResourcesSettingsState) {
    super(props, context);
    const { transcriptsPath, chatsPath } = props;
    this.state = { transcriptsPath, chatsPath };
  }

  public render(): JSX.Element {
    const { transcriptsInputError, dirty, transcriptsPath, chatsPath } = this.state;
    const saveDisabled = !dirty || !transcriptsPath;
    return (
      <Dialog title="Resource settings for this bot" cancel={ this.props.cancel }>
        <div className={ styles.container }>
          <TextField
            className={ styles.input }
            label="Locations for scripts"
            value={ chatsPath }
            onChanged={ this.onChangeChatInput }/>
          <a
            href="javascript:void(0);"
            data-prop="chatsPath"
            className={ styles.browseAnchor }
            onClick={ this.onBrowseClick }>
            Browse
          </a>
        </div>
        <div className={ styles.container }>
          <TextField
            className={ styles.input }
            label="Locations for transcripts"
            value={ transcriptsPath }
            required={ true }
            onChanged={ this.onChangeTranscriptInput }
            errorMessage={ transcriptsInputError }/>
          <a
            href="javascript:void(0);"
            data-prop="transcriptsPath"
            className={ styles.browseAnchor }
            onClick={ this.onBrowseClick }>
            Browse
          </a>
        </div>

        <DialogFooter>
          <DefaultButton onClick={ this.props.cancel }>Cancel</DefaultButton>
          <PrimaryButton disabled={ saveDisabled } onClick={ this.onSaveClick }>Save Changes</PrimaryButton>
        </DialogFooter>
      </Dialog>
    );
  }

  private onChangeChatInput = (chatsPath: string) => {
    this.setState({ chatsPath, dirty: true });
  }

  private onChangeTranscriptInput = (transcriptsPath: string) => {
    this.setState({ transcriptsPath, dirty: true });
  }

  private onSaveClick = () => {
    const { chatsPath, transcriptsPath } = this.state;
    const { path } = this.props;
    this.props.save({ chatsPath, transcriptsPath, path });
  }

  private onBrowseClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    const prop = event.currentTarget.getAttribute('data-prop');
    const result = await this.props.showOpenDialog();
    if (result) {
      this.setState({ [prop]: result, dirty: true });
    }
  }
}
