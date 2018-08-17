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

export namespace SharedConstants {
  export const NOTIFICATION_FROM_MAIN = 'NOTIFICATION_FROM_MAIN';
  export const TEMP_BOT_IN_MEMORY_PATH = 'TEMP_BOT_IN_MEMORY';

  /** Names of commands used in both main and client */
  export namespace Commands {

    export namespace Azure {
      export const RetrieveArmToken = 'azure:retrieve-arm-token';
      export const PersistAzureLoginChanged = 'azure:persist-azure-login-changed';
      export const SignUserOutOfAzure = 'azure:sign-user-out';
    }

    export namespace Bot {
      export const Create = 'bot:create';
      export const Save = 'bot:save';
      export const Open = 'bot:open';
      export const SetActive = 'bot:set-active';
      export const RestartEndpointService = 'bot:restart-endpoint-service';
      export const Close = 'bot:close';
      export const AddOrUpdateService = 'bot:add-or-update-service';
      export const RemoveService = 'bot:remove-service';
      export const PatchBotList = 'bot:list:patch';
      export const Switch = 'bot:switch';
      export const OpenBrowse = 'bot:browse-open';
      export const SyncBotList = 'bot:list:sync';
      export const OpenSettings = 'bot-settings:open';
      export const Load = 'bot:load';
      export const RemoveFromBotList = 'bot:list:remove';
    }

    export namespace ClientInit {
      export const Loaded = 'client:loaded';
      export const PostWelcomeScreen = 'client:post-welcome-screen';
    }

    export namespace Electron {
      export const ShowMessageBox = 'shell:show-message-box';
      export const ShowOpenDialog = 'shell:show-open-dialog';
      export const ShowSaveDialog = 'shell:show-save-dialog';
      export const UpdateFileMenu = 'menu:update-file-menu';
      export const SetFullscreen = 'electron:set-fullscreen';
      export const SetTitleBar = 'electron:set-title-bar';
      export const DisplayContextMenu = 'electron:display-context-menu';
      export const OpenExternal = 'electron:open-external';
      export const ToggleDevTools = 'shell:toggle-inspector-devtools';
      export const UpdateAvailable = 'shell:update-downloaded';
      export const UpdateNotAvailable = 'shell:update-not-available';
      export const ShowAboutDialog = 'shell:about';
    }

    export namespace Emulator {
      export const SaveTranscriptToFile = 'emulator:save-transcript-to-file';
      export const FeedTranscriptFromDisk = 'emulator:feed-transcript:disk';
      export const FeedTranscriptFromMemory = 'emulator:feed-transcript:deep-link';
      export const GetSpeechToken = 'speech-token:get';
      export const NewTranscript = 'transcript:new';
      export const NewLiveChat = 'livechat:new';
      export const OpenTranscript = 'transcript:open';
      export const PromptToOpenTranscript = 'transcript:prompt-open';
      export const ReloadTranscript = 'transcript:reload';
      export const OpenChatFile = 'chat:open';
      export const AppendToLog = 'log:append';
    }

    export namespace Extension {
      export const Connect = 'shell:extension-connect';
      export const Disconnect = 'shell:extension-disconnect';
    }

    export namespace File {
      export const Read = 'file:read';
      export const Write = 'file:write';
      export const SanitizeString = 'file:sanitize-string';
      export const Clear = 'file:clear';
      export const Add = 'file:add';
      export const Remove = 'file:remove';
      export const Changed = 'file:changed';
    }

    export namespace Luis {
      export const GetLuisServices = 'luis:getLuisServices';
    }

    export namespace Misc {
      export const GetStoreState = 'store:get-state';
    }

    export namespace Ngrok {
      export const Reconnect = 'ngrok:reconnect';
    }

    export namespace Notifications {
      export const Add = 'notification:add';
      export const Remove = 'notification:remove';
    }

    export namespace OAuth {
      export const SendTokenResponse = 'oauth:send-token-response';
      export const CreateOAuthWindow = 'oauth:create-oauth-window';
    }

    export namespace Settings {
      export const SaveAppSettings = 'app:settings:save';
      export const LoadAppSettings = 'app:settings:load';
      export const ReceiveGlobalSettings = 'receive-global-settings';
    }

    export namespace UI {
      export const ShowWelcomePage = 'welcome-page:show';
      export const ShowBotCreationDialog = 'bot-creation:show';
      export const ShowSecretPromptDialog = 'secret-prompt:show';
      export const SwitchNavBarTab = 'navbar:switch-tab';
      export const ShowExplorer = 'shell:show-explorer';
      export const ShowServices = 'shell:show-services';
      export const ShowAppSettings = 'shell:show-app-settings';
      export const SwitchTheme = 'shell:switchTheme';
      export const SignInToAzure = 'shell:signInToAzure';
      export const ArmTokenReceivedOnStartup = 'shell:armTokenReceivedOnStartup';
      export const ShowPostMigrationDialog = 'post-migration-dialog:show';
    }
  }
}
