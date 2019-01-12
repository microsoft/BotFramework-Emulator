//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { newNotification, SharedConstants } from "@bfemulator/app-shared";
import {
  BotConfigWithPath,
  BotConfigWithPathImpl,
  uniqueId
} from "@bfemulator/sdk-shared";
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton,
  Row,
  RowAlignment,
  TextField
} from "@bfemulator/ui-react";
import { EndpointService } from "botframework-config/lib/models";
import { IEndpointService, ServiceTypes } from "botframework-config/lib/schema";
import { ChangeEvent } from "react";
import * as React from "react";

import { beginAdd } from "../../../data/action/notificationActions";
import { store } from "../../../data/store";
import { CommandServiceImpl } from "../../../platform/commands/commandServiceImpl";
import { generateBotSecret } from "../../../utils";
import { ActiveBotHelper } from "../../helpers/activeBotHelper";
import { DialogService } from "../service";

import * as styles from "./botCreationDialog.scss";

export interface BotCreationDialogState {
  bot: BotConfigWithPath;
  endpoint: IEndpointService;
  secret: string;
  encryptKey: boolean;
  revealSecret: boolean;
}

export class BotCreationDialog extends React.Component<
  {},
  BotCreationDialogState
> {
  constructor(props: {}, context: BotCreationDialogState) {
    super(props, context);

    this.state = {
      bot: BotConfigWithPathImpl.fromJSON({
        name: "",
        description: "",
        padlock: "",
        services: [],
        path: ""
      }),
      endpoint: new EndpointService({
        type: ServiceTypes.Endpoint,
        name: "",
        id: uniqueId(),
        appId: "",
        appPassword: "",
        endpoint: ""
      }),
      secret: "",
      encryptKey: false,
      revealSecret: true
    };
  }

  public render(): JSX.Element {
    const { secret, bot, endpoint, encryptKey, revealSecret } = this.state;
    const secretCriteria = encryptKey ? secret : true;

    const requiredFieldsCompleted =
      bot && endpoint.endpoint && bot.name && secretCriteria;

    const endpointWarning = this.validateEndpoint(endpoint.endpoint);
    const endpointPlaceholder =
      "Your bot's endpoint (ex: http://localhost:3978/api/messages)";

    // TODO - localization
    return (
      <Dialog
        className={styles.main}
        title="New bot configuration"
        cancel={this.onCancel}
        maxWidth={648}
      >
        <div className={styles.botCreateForm}>
          <TextField
            value={this.state.bot.name}
            data-prop="name"
            onChange={this.onInputChange}
            label={"Bot name"}
            required={true}
          />
          <TextField
            onChange={this.onInputChange}
            data-prop="endpoint"
            placeholder={endpointPlaceholder}
            label={"Endpoint URL"}
            required={true}
            value={this.state.endpoint.endpoint}
          />
          {endpointWarning && (
            <span className={styles.endpointWarning}>{endpointWarning}</span>
          )}
          <Row className={styles.multiInputRow}>
            <TextField
              inputContainerClassName={styles.inputContainer}
              data-prop="appId"
              label="Microsoft App ID"
              onChange={this.onInputChange}
              placeholder="Optional"
              value={endpoint.appId}
            />
            <TextField
              inputContainerClassName={styles.inputContainer}
              label="Microsoft App password"
              data-prop="appPassword"
              onChange={this.onInputChange}
              placeholder="Optional"
              type="password"
              value={endpoint.appPassword}
            />
          </Row>
          <Checkbox
            label="Azure for US Government"
            onChange={this.onChannelServiceChange}
          />
          <Row align={RowAlignment.Bottom}>
            <Checkbox
              className={styles.encryptKeyCheckBox}
              label="Encrypt keys stored in your bot configuration."
              checked={encryptKey}
              onChange={this.onEncryptKeyChange}
            />
            <a href="https://aka.ms/bot-framework-bot-file-encryption">
              &nbsp;Learn more.
            </a>
          </Row>

          <TextField
            inputContainerClassName={styles.key}
            label="Secret "
            value={secret}
            placeholder="Your keys are not encrypted"
            disabled={true}
            id="key-input"
            type={revealSecret ? "text" : "password"}
          />
          <ul className={styles.actionsList}>
            <li>
              <a
                className={!encryptKey ? styles.disabledAction : ""}
                href="javascript:void(0);"
                onClick={this.onRevealSecretClick}
              >
                {revealSecret ? "Hide" : "Show"}
              </a>
            </li>
            <li>
              <a
                className={!encryptKey ? styles.disabledAction : ""}
                href="javascript:void(0);"
                onClick={this.onCopyClick}
              >
                Copy
              </a>
            </li>
            {/* <li>
              <a
                className={ !encryptKey ? styles.disabledAction : '' }
                href="javascript:void(0);"
                onClick={ this.onResetClick }>
                Generate new secret
              </a>
            </li> */}
          </ul>
        </div>

        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.onCancel} />
          <PrimaryButton
            text="Save and connect"
            onClick={this.onSaveAndConnect}
            disabled={!requiredFieldsCompleted}
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { prop } = event.target.dataset;
    if (prop === "name") {
      // attach to bot
      this.setState({ bot: { ...this.state.bot, name: value } });
    } else {
      this.setState({
        endpoint: { ...this.state.endpoint, ...{ [prop]: value } }
      } as any);
    }
  };

  private onChannelServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const channelService = checked ? "https://botframework.azure.us" : "";
    this.setState({
      endpoint: {
        ...this.state.endpoint,
        ...{ channelService }
      }
    } as any);
  };

  private onCancel = () => {
    DialogService.hideDialog();
  };

  private onEncryptKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const secret = checked ? generateBotSecret() : "";
    this.setState({ encryptKey: checked, secret, revealSecret: true });
  };

  private onRevealSecretClick = () => {
    if (!this.state.encryptKey) {
      return null;
    }
    this.setState({ revealSecret: !this.state.revealSecret });
  };

  private onCopyClick = (): void => {
    if (!this.state.encryptKey) {
      return null;
    }
    const input: HTMLInputElement = window.document.getElementById(
      "key-input"
    ) as HTMLInputElement;
    input.removeAttribute("disabled");
    const { type } = input;
    input.type = "text";
    input.select();
    window.document.execCommand("copy");
    input.type = type;
    input.setAttribute("disabled", "");
  };

  // TODO: Re-enable ability to re-generate secret after 4.1
  // See 'https://github.com/Microsoft/BotFramework-Emulator/issues/964' for more information
  // See also: botCreationDialog.spec.tsx

  // private onResetClick = (): void => {
  //   if (!this.state.encryptKey) {
  //     return null;
  //   }
  //   const generatedSecret = generateBotSecret();
  //   this.setState({ secret: generatedSecret });
  // }

  private onSaveAndConnect = async () => {
    try {
      const path = await this.showBotSaveDialog();
      if (path) {
        await this.performCreate(path);
      } else {
        // user cancelled out of the save dialog
        console.log("Bot creation save dialog was cancelled.");
      }
    } catch (e) {
      console.error("Error while trying to select a bot file location: ", e);
    }
  };

  private performCreate = async (botPath: string) => {
    const endpoint: IEndpointService = {
      type: this.state.endpoint.type,
      name: this.state.endpoint.endpoint.trim(),
      id: this.state.endpoint.id.trim(),
      appId: this.state.endpoint.appId.trim(),
      appPassword: this.state.endpoint.appPassword.trim(),
      endpoint: this.state.endpoint.endpoint.trim()
    };
    (endpoint as any).channelService = (this.state
      .endpoint as any).channelService;

    const bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      ...this.state.bot,
      name: this.state.bot.name.trim(),
      description: this.state.bot.description.trim(),
      services: [endpoint],
      path: botPath.trim()
    });

    const secret =
      this.state.encryptKey && this.state.secret ? this.state.secret : null;

    try {
      await ActiveBotHelper.confirmAndCreateBot(bot, secret);
    } catch (err) {
      const errMsg = `Error during confirm and create bot: ${err}`;
      const notification = newNotification(errMsg);
      store.dispatch(beginAdd(notification));
    } finally {
      DialogService.hideDialog();
    }
  };

  private showBotSaveDialog = async (): Promise<any> => {
    const { Commands } = SharedConstants;
    // get a safe bot file name
    const botFileName = await CommandServiceImpl.remoteCall(
      Commands.File.SanitizeString,
      this.state.bot.name
    );
    // TODO - Localization
    const dialogOptions = {
      filters: [
        {
          name: "Bot Files",
          extensions: ["bot"]
        }
      ],
      defaultPath: botFileName,
      showsTagField: false,
      title: "Save as",
      buttonLabel: "Save"
    };

    return CommandServiceImpl.remoteCall(
      Commands.Electron.ShowSaveDialog,
      dialogOptions
    );
  };

  /** Checks the endpoint to see if it has the correct route syntax at the end (/api/messages) */
  private validateEndpoint(endpoint: string): string {
    const controllerRegEx = /api\/messages\/?$/;
    return controllerRegEx.test(endpoint)
      ? ""
      : `Please include route if necessary: "/api/messages"`;
  }
}
