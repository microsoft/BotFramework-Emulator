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
import { connect } from 'react-redux';
import { disable as disablePresentationMode, executeCommand, SharedConstants } from '@bfemulator/app-shared';

import * as Constants from '../../constants';
import { RootState } from '../../state/store';
import { showWelcomePage } from '../../state/helpers/editorHelpers';
import { globalHandlers } from '../../utils/eventHandlers';

import { Main, MainProps } from './main';

const mapStateToProps = (state: RootState): MainProps => ({
  presentationModeEnabled: state.presentation.enabled,
  primaryEditor: state.editor.editors[Constants.EDITOR_KEY_PRIMARY],
  secondaryEditor: state.editor.editors[Constants.EDITOR_KEY_SECONDARY],
  explorerIsVisible: state.explorer.showing,
  navBarSelection: state.navBar.selection,
});

const mapDispatchToProps = (dispatch): MainProps => ({
  exitPresentationMode: (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispatch(disablePresentationMode());
    }
  },
  applicationMountComplete: async () => {
    await new Promise(resolve => {
      dispatch(executeCommand(true, SharedConstants.Commands.ClientInit.Loaded, resolve));
    });
    showWelcomePage();
    await new Promise(resolve => {
      dispatch(executeCommand(true, SharedConstants.Commands.ClientInit.PostWelcomeScreen, resolve));
    });
    window.addEventListener('keydown', globalHandlers, true);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
