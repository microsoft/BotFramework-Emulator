import { BotInfo } from "@bfemulator/app-shared";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton,
  TextField
} from "@bfemulator/ui-react";
import * as React from "react";
import { ChangeEvent, Component, MouseEvent } from "react";

import * as dialogStyles from "../dialogStyles.scss";

import * as styles from "./resourcesSettings.scss";

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

export class ResourcesSettings extends Component<
  ResourcesSettingsProps,
  ResourcesSettingsState
> {
  constructor(props: ResourcesSettingsProps, context: ResourcesSettingsState) {
    super(props, context);
    const { transcriptsPath, chatsPath } = props;
    this.state = { transcriptsPath, chatsPath };
  }

  public render(): JSX.Element {
    const {
      transcriptsInputError,
      dirty,
      transcriptsPath,
      chatsPath
    } = this.state;
    const saveDisabled = !dirty || !transcriptsPath;
    return (
      <Dialog
        title="Resource settings for this bot"
        cancel={this.props.cancel}
        className={dialogStyles.dialogLarge}
      >
        <div className={styles.container}>
          <TextField
            inputContainerClassName={styles.inputContainer}
            label="Locations for scripts"
            value={chatsPath}
            data-prop="chatsPath"
            onChange={this.onInputChange}
          />
          <a
            href="javascript:void(0);"
            data-prop="chatsPath"
            className={styles.browseAnchor}
            onClick={this.onBrowseClick}
          >
            Browse
          </a>
        </div>
        <div className={styles.container}>
          <TextField
            inputContainerClassName={styles.inputContainer}
            label="Locations for transcripts"
            value={transcriptsPath}
            data-prop="z"
            required={true}
            onChange={this.onInputChange}
            errorMessage={transcriptsInputError}
          />
          <a
            href="javascript:void(0);"
            data-prop="transcriptsPath"
            className={styles.browseAnchor}
            onClick={this.onBrowseClick}
          >
            Browse
          </a>
        </div>

        <DialogFooter>
          <DefaultButton onClick={this.props.cancel}>Cancel</DefaultButton>
          <PrimaryButton disabled={saveDisabled} onClick={this.onSaveClick}>
            Save Changes
          </PrimaryButton>
        </DialogFooter>
      </Dialog>
    );
  }

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { prop } = event.target.dataset;
    this.setState({ [prop]: value, dirty: true });
  };

  private onSaveClick = () => {
    const { chatsPath, transcriptsPath } = this.state;
    const { path } = this.props;
    this.props.save({ chatsPath, transcriptsPath, path });
  };

  private onBrowseClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    const prop = event.currentTarget.getAttribute("data-prop");
    const result = await this.props.showOpenDialog();
    if (result) {
      this.setState({ [prop]: result, dirty: true });
    }
  };
}
