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
import { FrameworkSettings, SharedConstants } from '@bfemulator/app-shared';
import { connect } from 'react-redux';
import { Action } from 'redux';

import { DOCUMENT_ID_APP_SETTINGS } from '../../../constants';
import * as EditorActions from '../../../data/action/editorActions';
import { getFrameworkSettings } from '../../../data/action/frameworkSettingsActions';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { RootState } from '../../../data/store';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { debounce } from '../../../utils';
import { saveFrameworkSettings } from '../../../data/action/frameworkSettingsActions';

import { AppSettingsEditor, AppSettingsEditorProps } from './appSettingsEditor';

const mapStateToProps = (state: RootState, ownProps: AppSettingsEditorProps) => ({
  ...ownProps,
  framework: state.framework,
});

const mapDispatchToProps = (dispatch: (action: Action) => void, ownProps: AppSettingsEditorProps) => ({
  discardChanges: () =>
    dispatch(EditorActions.close(getTabGroupForDocument(ownProps.documentId), DOCUMENT_ID_APP_SETTINGS)),
  openBrowseForNgrok: async () => {
    const dialogOptions = {
      title: 'Browse for ngrok',
      buttonLabel: 'Select ngrok',
      properties: ['openFile'],
    };
    return CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowOpenDialog, dialogOptions);
  },
  getFrameworkSettings: () => dispatch(getFrameworkSettings()),
  saveFrameworkSettings: (framework: FrameworkSettings) => dispatch(saveFrameworkSettings(framework)),
  setDirtyFlag: debounce((dirty: boolean) => dispatch(EditorActions.setDirtyFlag(ownProps.documentId, dirty)), 300),
});

export const AppSettingsEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppSettingsEditor);
