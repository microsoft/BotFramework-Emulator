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

const EDITOR_KEY_PRIMARY = 'primary';
const EDITOR_KEY_SECONDARY = 'secondary';

export const SharedConstants = {
  NOTIFICATION_FROM_MAIN: 'NOTIFICATION_FROM_MAIN',
  TEMP_BOT_IN_MEMORY_PATH: 'TEMP_BOT_IN_MEMORY',
  EDITOR_KEY_PRIMARY,
  EDITOR_KEY_SECONDARY,
  EmulatedOAuthUrlProtocol: 'oauth:',
  OAuthUrlProtocol: 'oauthlink:',

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
      CheckForUpdates: 'shell:check-for-updates',
      FetchRemote: 'shell:fetch-remote',
      ShowMessageBox: 'shell:showExplorer-message-box',
      ShowOpenDialog: 'shell:showExplorer-open-dialog',
      ShowSaveDialog: 'shell:showExplorer-save-dialog',
      UpdateFileMenu: 'menu:update-file-menu',
      UpdateConversationMenu: 'menu:update-conversation-menu',
      SetTitleBar: 'electron:set-title-bar',
      DisplayContextMenu: 'electron:display-context-menu',
      OpenExternal: 'electron:open-external',
      ToggleDevTools: 'shell:toggle-inspector-devtools',
      OpenFileLocation: 'shell:open-file-location',
      UnlinkFile: 'shell:unlink-file',
      RenameFile: 'shell:rename-file',
      QuitAndInstall: 'shell:quit-and-install',
      CopyFile: 'shell:copy-file',
    },

    Emulator: {
      SaveTranscriptToFile: 'emulator:save-transcript-to-file',
      ExtractActivitiesFromFile: 'emulator:extract-activities-from-file',
      GetServiceUrl: 'shell:get-service-url',
      GetSpeechToken: 'speech-token:get',
      NewLiveChat: 'livechat:new',
      OpenTranscript: 'transcript:open',
      PromptToOpenTranscript: 'transcript:prompt-open',
      ReloadTranscript: 'transcript:reload',
      AppendToLog: 'log:append',
      DeleteConversation: 'emulator:delete-conversation',
      StartEmulator: 'emulator:start',
      OpenProtocolUrls: 'emulator:openProtocolUrls',
      ClearState: 'emulator:clear-state',
      SendConversationUpdateUserAdded: 'emulator:send-activity:user-added',
      SendBotContactAdded: 'emulator:send-activity:bot-contact-added',
      SendBotContactRemoved: 'emulator:send-activity:bot-contact-removed',
      SendTyping: 'emulator:send-activity:typing',
      SendPing: 'emulator:send-activity:ping',
      SendDeleteUserData: 'emulator:send-activity:delete-user-data',
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

    Notifications: {
      Add: 'notification:add',
      Remove: 'notification:remove',
    },

    OAuth: {
      SendTokenResponse: 'oauth:send-token-response',
      CreateOAuthWindow: 'oauth:create-oauth-window',
    },

    Settings: {
      LoadAppSettings: 'app:settings:load',
      ReceiveGlobalSettings: 'receive-global-settings',
      SaveBotUrl: 'settings:save-bot-url',
    },

    Telemetry: {
      TrackEvent: 'telemetry:track-event',
    },

    UI: {
      ShowMarkdownPage: 'markdown-page:showExplorer',
      ShowWelcomePage: 'welcome-page:showExplorer',
      ShowBotCreationDialog: 'bot-creation:showExplorer',
      ShowOpenBotDialog: 'open-bot:show',
      ShowSecretPromptDialog: 'secret-prompt:showExplorer',
      SwitchNavBarTab: 'navbar:switch-tab',
      ShowAppSettings: 'shell:showExplorer-app-settings',
      SwitchTheme: 'shell:switchTheme',
      SignInToAzure: 'shell:signInToAzure',
      ArmTokenReceivedOnStartup: 'shell:armTokenReceivedOnStartup',
      ShowPostMigrationDialog: 'post-migration-dialog:show',
      UpdateProgressIndicator: 'shell:updateProgressIndicator',
      InvalidateAzureArmToken: 'shell:invalidateAzureArmToken',
      ShowUpdateAvailableDialog: 'update-available-dialog:show',
      ShowUpdateUnavailableDialog: 'update-unavailable-dialog:show',
      ShowProgressIndicator: 'progress-indicator:show',
      ShowOpenUrlDialog: 'chat:open-url',
      ShowDataCollectionDialog: 'data-collection:show',
      ShowCustomActivityEditor: 'custom-activity-editor:show',
      ToggleFullScreen: 'shell:toggle-full-screen',
    },
  },
  ContentTypes: {
    CONTENT_TYPE_LIVE_CHAT: 'application/vnd.microsoft.bfemulator.document.livechat',
    CONTENT_TYPE_DEBUG: 'application/vnd.microsoft.bfemulator.document.debug',
    CONTENT_TYPE_MARKDOWN: 'application/vnd.microsoft.bfemulator.document.markdown',
    CONTENT_TYPE_APP_SETTINGS: 'application/vnd.microsoft.bfemulator.document.appsettings',
    CONTENT_TYPE_WELCOME_PAGE: 'application/vnd.microsoft.bfemulator.document.welcome',
    CONTENT_TYPE_TRANSCRIPT: 'application/vnd.microsoft.bfemulator.document.transcript',
  },
  Channels: {
    ReadmeUrl: 'https://raw.githubusercontent.com/Microsoft/BotFramework-Emulator/main/content/CHANNELS.md',
    HelpLabel: 'Get started with channels (Bot Inspector)',
  },
  DocumentIds: {
    DOCUMENT_ID_APP_SETTINGS: 'app:settings',
    DOCUMENT_ID_BOT_SETTINGS: 'bot:settings',
    DOCUMENT_ID_WELCOME_PAGE: 'welcome-page',
    DOCUMENT_ID_MARKDOWN_PAGE: 'markdown-page',
  },
  EditorKeys: [EDITOR_KEY_PRIMARY, EDITOR_KEY_SECONDARY],
  NavBarItems: {
    NAVBAR_BOT_EXPLORER: 'navbar.botExplorer',
    NAVBAR_SETTINGS: 'navbar.settings',
    NAVBAR_NOTIFICATIONS: 'navbar.notifications',
    NAVBAR_RESOURCES: 'navbar:resources',
  },
  Activity: {
    USER_ROLE: 'user',
    BOT_ROLE: 'bot',
  },
};
