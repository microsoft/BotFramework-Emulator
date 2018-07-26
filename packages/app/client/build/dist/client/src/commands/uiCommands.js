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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showWelcomePage } from '../data/editorHelpers';
import { AzureLoginPromptDialogContainer, AzureLoginSuccessDialogContainer, BotCreationDialog, DialogService, SecretPromptDialog } from '../ui/dialogs';
import store from '../data/store';
import * as EditorActions from '../data/action/editorActions';
import * as NavBarActions from '../data/action/navBarActions';
import * as Constants from '../constants';
import { SharedConstants } from '@bfemulator/app-shared';
import { beginAzureAuthWorkflow } from '../data/action/azureAuthActions';
/** Register UI commands (toggling UI) */
export function registerCommands(commandRegistry) {
    const Commands = SharedConstants.Commands.UI;
    // ---------------------------------------------------------------------------
    // Shows the welcome page
    commandRegistry.registerCommand(Commands.ShowWelcomePage, () => {
        showWelcomePage();
    });
    // ---------------------------------------------------------------------------
    // Shows a bot creation dialog
    commandRegistry.registerCommand(Commands.ShowBotCreationDialog, () => __awaiter(this, void 0, void 0, function* () {
        return yield DialogService.showDialog(BotCreationDialog);
    }));
    // ---------------------------------------------------------------------------
    // Shows a dialog prompting the user for a bot secret
    commandRegistry.registerCommand(Commands.ShowSecretPromptDialog, () => __awaiter(this, void 0, void 0, function* () {
        return yield DialogService.showDialog(SecretPromptDialog);
    }));
    // ---------------------------------------------------------------------------
    // Switches navbar tab selection
    commandRegistry.registerCommand(Commands.SwitchNavBarTab, (tabName) => {
        store.dispatch(NavBarActions.select(tabName));
    });
    // ---------------------------------------------------------------------------
    // Switches navbar tab selection to Explorer
    commandRegistry.registerCommand(Commands.ShowExplorer, () => {
        store.dispatch(NavBarActions.select(Constants.NAVBAR_BOT_EXPLORER));
    });
    // ---------------------------------------------------------------------------
    // Switches navbar tab selection to Services
    commandRegistry.registerCommand(Commands.ShowServices, () => {
        store.dispatch(NavBarActions.select(Constants.NAVBAR_SERVICES));
    });
    // ---------------------------------------------------------------------------
    // Open App Settings
    commandRegistry.registerCommand(Commands.ShowAppSettings, () => {
        const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
        store.dispatch(EditorActions.open(CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS, true, null));
    });
    // ---------------------------------------------------------------------------
    // Theme switching from main
    commandRegistry.registerCommand(Commands.SwitchTheme, themeHref => {
        const themeTag = document.getElementById('themeVars');
        if (themeTag) {
            themeTag.href = themeHref;
        }
    });
    // ---------------------------------------------------------------------------
    // Azure sign in
    commandRegistry.registerCommand(Commands.SignInToAzure, () => {
        store.dispatch(beginAzureAuthWorkflow(AzureLoginPromptDialogContainer, AzureLoginSuccessDialogContainer));
    });
}
//# sourceMappingURL=uiCommands.js.map