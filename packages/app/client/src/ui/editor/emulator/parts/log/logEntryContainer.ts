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

import { executeCommand, setHighlightedObjects, setInspectorObjects, SharedConstants } from '@bfemulator/app-shared';
import * as ConnectedServiceActions from '@bfemulator/app-shared/built/state/actions/connectedServiceActions';
import { connect } from 'react-redux';
import { ServiceTypes } from 'botframework-config/lib/schema';

import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectServicePromptDialogContainer,
  GetStartedWithCSDialogContainer,
  ProgressIndicatorContainer,
} from '../../../../dialogs';
import { ConnectedServicePickerContainer } from '../../../../shell/explorer/servicesExplorer';
import { ConnectedServiceEditorContainer } from '../../../../shell/explorer/servicesExplorer/connectedServiceEditor';

import { LogEntry as LogEntryComponent, LogEntryProps } from './logEntry';

function mapDispatchToProps(dispatch: any): Partial<LogEntryProps> {
  return {
    launchLuisEditor: () => {
      dispatch(
        ConnectedServiceActions.launchConnectedServicePicker({
          azureAuthWorkflowComponents: {
            promptDialog: ConnectServicePromptDialogContainer,
            loginSuccessDialog: AzureLoginSuccessDialogContainer,
            loginFailedDialog: AzureLoginFailedDialogContainer,
          },
          pickerComponent: ConnectedServicePickerContainer,
          getStartedDialog: GetStartedWithCSDialogContainer,
          editorComponent: ConnectedServiceEditorContainer,
          progressIndicatorComponent: ProgressIndicatorContainer,
          serviceType: ServiceTypes.Luis,
        })
      );
    },
    setInspectorObjects: (documentId: string, obj: any) => dispatch(setInspectorObjects(documentId, obj)),
    setHighlightedObjects: (documentId: string, obj: any) => dispatch(setHighlightedObjects(documentId, obj)),
    showAppSettings: () => {
      const { UI } = SharedConstants.Commands;
      return dispatch(executeCommand(false, UI.ShowAppSettings));
    },
    trackEvent: (name: string, properties?: { [key: string]: any }) => {
      dispatch(executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, name, properties));
    },
  };
}

export const LogEntry = connect(null, mapDispatchToProps)(LogEntryComponent);
