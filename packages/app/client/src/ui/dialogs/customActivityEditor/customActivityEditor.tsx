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

import { ConversationService } from '@bfemulator/sdk-shared';
import { DefaultButton, Dialog, PrimaryButton } from '@bfemulator/ui-react';
import React, { useCallback, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

import customActivitySchema from './customActivitySchema.json';
import styles from './customActivityEditor.scss';
import { DialogService } from '../service';

type CustomActivityEditorProps = {
  conversationId: string;
  serverUrl: string;
};

const editorDefault = {
  text: 'Hello world!',
  type: 'message',
};

export const CustomActivityEditor: React.FC<CustomActivityEditorProps> = props => {
  const [json, setJson] = useState(JSON.stringify(editorDefault));
  const [isValid, setIsValid] = useState(false);
  const { conversationId, serverUrl } = props;

  useEffect(() => {
    // create a model that validates against our custom activity schema
    // TODO: get custom schema validation errors to show as errors
    const model = monaco.editor.createModel(JSON.stringify(editorDefault, null, 2), 'json');
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'bfemulator://schemas/customActivity.json',
          fileMatch: ['*'],
          schema: customActivitySchema,
        },
      ],
    });
    const editor = monaco.editor.create(document.getElementById('monaco-container'), {
      model,
    });
    // store the updated editor's content in state
    editor.onDidChangeModelContent(e => {
      const val = editor.getValue();
      setJson(val);
    });
    // disable "send" button depending on JSON validation
    editor.onDidChangeModelDecorations(e => {
      const markers = monaco.editor.getModelMarkers({ owner: 'json' });
      // warnings are 4 and errors are 8
      if (markers.some(m => m.severity >= monaco.MarkerSeverity.Warning)) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    });
  }, []);

  const onClick = useCallback(() => {
    const activity = JSON.parse(json);
    ConversationService.sendActivityToBot(serverUrl, conversationId, activity);
  }, [conversationId, json, serverUrl]);

  const onDismiss = useCallback(() => {
    DialogService.hideDialog();
  }, []);

  return (
    <Dialog cancel={onDismiss}>
      <div className={styles.container}>
        <div id="monaco-container" className={styles.monacoContainer}></div>
        <div className={styles.buttonContainer}>
          <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
          <PrimaryButton className={styles.sendButton} disabled={!isValid} onClick={onClick}>
            Send activity
          </PrimaryButton>
        </div>
      </div>
    </Dialog>
  );

  // return (
  //   <div className={styles.container}>
  //     <div id="monaco-container" className={styles.monacoContainer}></div>
  //     <div className={styles.buttonContainer}>
  //       <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
  //       <PrimaryButton className={styles.sendButton} disabled={!isValid} onClick={onClick}>
  //         Send activity
  //       </PrimaryButton>
  //     </div>
  //   </div>
  // );
};
