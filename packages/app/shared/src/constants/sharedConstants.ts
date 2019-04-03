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

export const SharedConstants = {
  NOTIFICATION_FROM_MAIN: 'NOTIFICATION_FROM_MAIN',
  TEMP_BOT_IN_MEMORY_PATH: 'TEMP_BOT_IN_MEMORY',

  /** Names of commands used in both main and client */
  Commands: {
    Azure: {
      RetrieveArmToken: 'azure:retrieve-arm-token',
      PersistAzureLoginChanged: 'azure:persist-azure-login-changed',
      SignUserOutOfAzure: 'azure:sign-user-out',
    },

    Bot: {
      Create: 'bot:create',
      Save: 'bot:save',
      Open: 'bot:open',
      SetActive: 'bot:set-active',
      RestartEndpointService: 'bot:restart-endpoint-service',
      Close: 'bot:close',
      AddOrUpdateService: 'bot:add-or-update-service',
      RemoveService: 'bot:remove-service',
      PatchBotList: 'bot:list:patch',
      Switch: 'bot:switch',
      OpenBrowse: 'bot:browse-open',
      SyncBotList: 'bot:list:sync',
      Load: 'bot:load',
      RemoveFromBotList: 'bot:list:remove',
      WatchForTranscriptFiles: 'bot:watch-for-transcript-files',
      WatchForChatFiles: 'bot:watch-for-chat-files',
      ChatFilesUpdated: 'bot:chat-files-updated',
      TranscriptFilesUpdated: 'bot:transcript-files-updated',
      TranscriptsPathUpdated: 'bot:transcripts-path-updated',
      ChatsPathUpdated: 'bot:chats-path-updated',
    },

    ClientInit: {
      Loaded: 'client:loaded',
      PostWelcomeScreen: 'client:post-welcome-screen',
    },

    Electron: {
      ShowMessageBox: 'shell:showExplorer-message-box',
      ShowOpenDialog: 'shell:showExplorer-open-dialog',
      ShowSaveDialog: 'shell:showExplorer-save-dialog',
      UpdateFileMenu: 'menu:update-file-menu',
      UpdateDebugModeMenuItem: 'menu:update-debug-mode-menu-item',
      UpdateConversationMenu: 'menu:update-conversation-menu',
      SetFullscreen: 'electron:set-fullscreen',
      SetTitleBar: 'electron:set-title-bar',
      DisplayContextMenu: 'electron:display-context-menu',
      OpenExternal: 'electron:open-external',
      ToggleDevTools: 'shell:toggle-inspector-devtools',
      UpdateAvailable: 'shell:update-downloaded',
      UpdateNotAvailable: 'shell:update-not-available',
      ShowAboutDialog: 'shell:about',
      OpenFileLocation: 'shell:open-file-location',
      UnlinkFile: 'shell:unlink-file',
      RenameFile: 'shell:rename-file',
    },

    Emulator: {
      SaveTranscriptToFile: 'emulator:save-transcript-to-file',
      FeedTranscriptFromDisk: 'emulator:feed-transcript:disk',
      FeedTranscriptFromMemory: 'emulator:feed-transcript:deep-link',
      GetSpeechToken: 'speech-token:get',
      NewTranscript: 'transcript:new',
      NewLiveChat: 'livechat:new',
      OpenTranscript: 'transcript:open',
      PromptToOpenTranscript: 'transcript:prompt-open',
      ReloadTranscript: 'transcript:reload',
      OpenChatFile: 'chat:open',
      AppendToLog: 'log:append',
      SetCurrentUser: 'emulator:set-current-user',
      DeleteConversation: 'emulator:delete-conversation',
    },

    Extension: {
      Connect: 'shell:extension-connect',
      Disconnect: 'shell:extension-disconnect',
    },

    File: {
      Read: 'file:read',
      Write: 'file:write',
      SanitizeString: 'file:sanitize-string',
      Clear: 'file:clear',
      Add: 'file:add',
      Remove: 'file:remove',
      Changed: 'file:changed',
    },

    ConnectedService: {
      GetConnectedServicesByType: 'connectedService:getConnectedServicesByType',
    },

    Misc: {
      GetStoreState: 'store:get-state',
    },

    Ngrok: {
      Reconnect: 'ngrok:reconnect',
      KillProcess: 'ngrok:killProcess',
    },

    Notifications: {
      Add: 'notification:add',
      Remove: 'notification:remove',
    },

    OAuth: {
      SendTokenResponse: 'oauth:send-token-response',
      CreateOAuthWindow: 'oauth:create-oauth-window',
    },

    Settings: {
      SaveAppSettings: 'app:settings:save',
      LoadAppSettings: 'app:settings:load',
      ReceiveGlobalSettings: 'receive-global-settings',
      PushClientAwareSettings: 'push-client-aware-settings',
    },

    Telemetry: {
      TrackEvent: 'telemetry:track-event',
    },

    UI: {
      ShowWelcomePage: 'welcome-page:showExplorer',
      ShowBotCreationDialog: 'bot-creation:showExplorer',
      ShowOpenBotDialog: 'open-bot:show',
      ShowSecretPromptDialog: 'secret-prompt:showExplorer',
      SwitchNavBarTab: 'navbar:switch-tab',
      ShowAppSettings: 'shell:showExplorer-app-settings',
      SwitchDebugMode: 'shell:switchDebugMode',
      SwitchTheme: 'shell:switchTheme',
      SignInToAzure: 'shell:signInToAzure',
      ArmTokenReceivedOnStartup: 'shell:armTokenReceivedOnStartup',
      ShowPostMigrationDialog: 'post-migration-dialog:show',
      UpdateProgressIndicator: 'shell:updateProgressIndicator',
      InvalidateAzureArmToken: 'shell:invalidateAzureArmToken',
      ShowUpdateAvailableDialog: 'update-available-dialog:show',
      ShowUpdateUnavailableDialog: 'update-unavailable-dialog:show',
      ShowProgressIndicator: 'progress-indicator:show',
    },
  },
  ContentTypes: {
    CONTENT_TYPE_LIVE_CHAT: 'application/vnd.microsoft.bfemulator.document.livechat',
  },
};
