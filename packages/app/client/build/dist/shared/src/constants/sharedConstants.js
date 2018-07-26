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
export var SharedConstants;
(function (SharedConstants) {
    SharedConstants.TEMP_BOT_IN_MEMORY_PATH = 'TEMP_BOT_IN_MEMORY';
    /** Names of commands used in both main and client */
    let Commands;
    (function (Commands) {
        let Bot;
        (function (Bot) {
            Bot.Create = 'bot:create';
            Bot.Save = 'bot:save';
            Bot.Open = 'bot:open';
            Bot.SetActive = 'bot:set-active';
            Bot.RestartEndpointService = 'bot:restart-endpoint-service';
            Bot.Close = 'bot:close';
            Bot.AddOrUpdateService = 'bot:add-or-update-service';
            Bot.RemoveService = 'bot:remove-service';
            Bot.PatchBotList = 'bot:list:patch';
            Bot.Switch = 'bot:switch';
            Bot.OpenBrowse = 'bot:browse-open';
            Bot.SyncBotList = 'bot:list:sync';
            Bot.OpenSettings = 'bot-settings:open';
            Bot.Load = 'bot:load';
        })(Bot = Commands.Bot || (Commands.Bot = {}));
        let ClientInit;
        (function (ClientInit) {
            ClientInit.Loaded = 'client:loaded';
            ClientInit.PostWelcomeScreen = 'client:post-welcome-screen';
        })(ClientInit = Commands.ClientInit || (Commands.ClientInit = {}));
        let Electron;
        (function (Electron) {
            Electron.ShowMessageBox = 'shell:show-message-box';
            Electron.ShowOpenDialog = 'shell:show-open-dialog';
            Electron.ShowSaveDialog = 'shell:show-save-dialog';
            Electron.UpdateRecentBotsInMenu = 'menu:update-recent-bots';
            Electron.SetFullscreen = 'electron:set-fullscreen';
            Electron.SetTitleBar = 'electron:set-title-bar';
            Electron.DisplayContextMenu = 'electron:display-context-menu';
            Electron.OpenExternal = 'electron:open-external';
            Electron.ToggleDevTools = 'shell:toggle-inspector-devtools';
            Electron.UpdateAvailable = 'shell:update-downloaded';
            Electron.UpdateNotAvailable = 'shell:update-not-available';
            Electron.ShowAboutDialog = 'shell:about';
        })(Electron = Commands.Electron || (Commands.Electron = {}));
        let Emulator;
        (function (Emulator) {
            Emulator.SaveTranscriptToFile = 'emulator:save-transcript-to-file';
            Emulator.FeedTranscriptFromDisk = 'emulator:feed-transcript:disk';
            Emulator.FeedTranscriptFromMemory = 'emulator:feed-transcript:deep-link';
            Emulator.GetSpeechToken = 'speech-token:get';
            Emulator.NewTranscript = 'transcript:new';
            Emulator.NewLiveChat = 'livechat:new';
            Emulator.OpenTranscript = 'transcript:open';
            Emulator.PromptToOpenTranscript = 'transcript:prompt-open';
            Emulator.ReloadTranscript = 'transcript:reload';
            Emulator.OpenChatFile = 'chat:open';
            Emulator.AppendToLog = 'log:append';
        })(Emulator = Commands.Emulator || (Commands.Emulator = {}));
        let Extension;
        (function (Extension) {
            Extension.Connect = 'shell:extension-connect';
            Extension.Disconnect = 'shell:extension-disconnect';
        })(Extension = Commands.Extension || (Commands.Extension = {}));
        let File;
        (function (File) {
            File.Read = 'file:read';
            File.Write = 'file:write';
            File.SanitizeString = 'file:sanitize-string';
            File.Clear = 'file:clear';
            File.Add = 'file:add';
            File.Remove = 'file:remove';
            File.Changed = 'file:changed';
        })(File = Commands.File || (Commands.File = {}));
        let Azure;
        (function (Azure) {
            Azure.RetrieveArmToken = 'azure:retrieve-arm-token';
            Azure.PersistAzureLoginChanged = 'azure:persist-azure-login-changed';
        })(Azure = Commands.Azure || (Commands.Azure = {}));
        let Misc;
        (function (Misc) {
            Misc.GetStoreState = 'store:get-state';
        })(Misc = Commands.Misc || (Commands.Misc = {}));
        let OAuth;
        (function (OAuth) {
            OAuth.SendTokenResponse = 'oauth:send-token-response';
            OAuth.GetStoreOAuthWindow = 'oauth:get-store-oauth-window';
        })(OAuth = Commands.OAuth || (Commands.OAuth = {}));
        let Settings;
        (function (Settings) {
            Settings.SaveAppSettings = 'app:settings:save';
            Settings.LoadAppSettings = 'app:settings:load';
            Settings.ReceiveGlobalSettings = 'receive-global-settings';
        })(Settings = Commands.Settings || (Commands.Settings = {}));
        let UI;
        (function (UI) {
            UI.ShowWelcomePage = 'welcome-page:show';
            UI.ShowBotCreationDialog = 'bot-creation:show';
            UI.ShowSecretPromptDialog = 'secret-prompt:show';
            UI.SwitchNavBarTab = 'navbar:switch-tab';
            UI.ShowExplorer = 'shell:show-explorer';
            UI.ShowServices = 'shell:show-services';
            UI.ShowAppSettings = 'shell:show-app-settings';
            UI.SwitchTheme = 'shell:switchTheme';
            UI.SignInToAzure = 'shell:signInToAzure';
        })(UI = Commands.UI || (Commands.UI = {}));
    })(Commands = SharedConstants.Commands || (SharedConstants.Commands = {}));
})(SharedConstants || (SharedConstants = {}));
//# sourceMappingURL=sharedConstants.js.map