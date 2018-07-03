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
  export const TEMP_BOT_IN_MEMORY_PATH: string = 'TEMP_BOT_IN_MEMORY';

  /** Names of commands used in both main and client */
  export namespace Commands {
    export namespace Bot {
      export const Create: string = 'bot:create';
      export const Save: string = 'bot:save';
      export const Open: string = 'bot:open';
      export const SetActive: string = 'bot:set-active';
      export const RestartEndpointService: string = 'bot:restart-endpoint-service';
      export const Close: string = 'bot:close';
      export const AddOrUpdateService: string = 'bot:add-or-update-service';
      export const RemoveService: string = 'bot:remove-service';
      export const PatchBotList: string = 'bot:list:patch';
      export const Switch: string = 'bot:switch';
      export const OpenBrowse: string = 'bot:browse-open';
      export const SyncBotList: string = 'bot:list:sync';
      export const OpenSettings: string = 'bot-settings:open';
      export const Load: string = 'bot:load';
    }

    export namespace ClientInit {
      export const Loaded: string = 'client:loaded';
      export const PostWelcomeScreen: string = 'client:post-welcome-screen';
    }

    export namespace Electron {
      export const ShowMessageBox: string = 'shell:show-message-box';
      export const ShowOpenDialog: string = 'shell:show-open-dialog';
      export const ShowSaveDialog: string = 'shell:show-save-dialog';
      export const UpdateRecentBotsInMenu: string = 'menu:update-recent-bots';
      export const SetFullscreen: string = 'electron:set-fullscreen';
      export const SetTitleBar: string = 'electron:set-title-bar';
      export const DisplayContextMenu: string = 'electron:display-context-menu';
      export const OpenExternal: string = 'electron:open-external';
      export const ToggleDevTools: string = 'shell:toggle-inspector-devtools';
      export const UpdateAvailable: string = 'shell:update-downloaded';
      export const UpdateNotAvailable: string = 'shell:update-not-available';
      export const ShowAboutDialog: string = 'shell:about';
    }

    export namespace Emulator {
      export const SaveTranscriptToFile: string = 'emulator:save-transcript-to-file';
      export const FeedTranscriptFromDisk: string = 'emulator:feed-transcript:disk';
      export const FeedTranscriptFromMemory: string = 'emulator:feed-transcript:deep-link';
      export const GetSpeechToken: string = 'speech-token:get';
      export const NewTranscript: string = 'transcript:new';
      export const NewLiveChat: string = 'livechat:new';
      export const OpenTranscript: string = 'transcript:open';
      export const PromptToOpenTranscript: string = 'transcript:prompt-open';
      export const ReloadTranscript: string = 'transcript:reload';
      export const OpenChatFile: string = 'chat:open';
      export const AppendToLog: string = 'log:append';
    }

    export namespace File {
      export const Read: string = 'file:read';
      export const Write: string = 'file:write';
      export const SanitizeString: string = 'file:sanitize-string';
      export const Clear: string = 'file:clear';
      export const Add: string = 'file:add';
      export const Remove: string = 'file:remove';
      export const Changed: string = 'file:changed';
    }

    export namespace Luis {
      export const RetrieveAuthoringKey: string = 'luis:retrieve-authoring-key';
    }

    export namespace Misc {
      export const GetStoreState: string = 'store:get-state';
    }

    export namespace OAuth {
      export const SendTokenResponse: string = 'oauth:send-token-response';
      export const GetStoreOAuthWindow: string = 'oauth:get-store-oauth-window';
    }

    export namespace Settings {
      export const SaveAppSettings: string = 'app:settings:save';
      export const LoadAppSettings: string = 'app:settings:load';
    }

    export namespace UI {
      export const ShowWelcomePage: string = 'welcome-page:show';
      export const ShowBotCreationDialog: string = 'bot-creation:show';
      export const ShowSecretPromptDialog: string = 'secret-prompt:show';
      export const SwitchNavBarTab: string = 'navbar:switch-tab';
      export const ShowExplorer: string = 'shell:show-explorer';
      export const ShowServices: string = 'shell:show-services';
      export const ShowAppSettings: string = 'shell:show-app-settings';
    }
  }
}
