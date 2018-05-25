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

import * as React from 'react';

import * as Constants from '../../../constants';
import { EmulatorTab, GenericTab } from './index';
import { Document } from '../../../data/reducer/editor';

interface TabFactoryProps {
  document?: Document;
}

export const TabFactory = (props: TabFactoryProps) => {
  // TODO - localization
  if (props && props.document) {
    switch (props.document.contentType) {
      case Constants.CONTENT_TYPE_LIVE_CHAT:
        return (<EmulatorTab mode="livechat" documentId={ props.document.documentId } dirty={ props.document.dirty }/>);

      case Constants.CONTENT_TYPE_TRANSCRIPT:
        return (
          <EmulatorTab mode="transcript" documentId={ props.document.documentId } dirty={ props.document.dirty }/>);

      case Constants.CONTENT_TYPE_BOT_SETTINGS:
        return (<GenericTab documentId={ props.document.documentId } title={ 'Bot Settings' }
                            dirty={ props.document.dirty }/>);

      case Constants.CONTENT_TYPE_WELCOME_PAGE:
        return (
          <GenericTab documentId={ props.document.documentId } title={ 'Welcome' } dirty={ props.document.dirty }/>);

      case Constants.CONTENT_TYPE_APP_SETTINGS:
        return (<GenericTab documentId={ props.document.documentId } title={ 'Emulator Settings' }
                            dirty={ props.document.dirty }/>);

      default:
        break;
    }
  }
  return null;
};
