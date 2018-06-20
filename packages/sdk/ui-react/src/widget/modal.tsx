/* tslint:disable:max-line-length */
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
import { loadTheme } from '@uifabric/styling';
import { Dialog, DialogType, IDialogContentProps, IDialogStyles } from 'office-ui-fabric-react/lib-commonjs/Dialog';
import * as React from 'react';
import { modalTheme } from '../styles';

export {
  DialogContent as ModalContent,
  DialogFooter as ModalActions
} from 'office-ui-fabric-react/lib-commonjs/Dialog';

export interface ModalProps extends React.Props<any> {
  cancel: (event: any) => void;
  title?: string;
  detailedDescription?: string;
  maxWidth?: number;
  className?: string;
}

export function Modal(props: ModalProps): JSX.Element {
  const content: IDialogContentProps = {
    type: DialogType.normal,
    title: props.title,
    subText: props.detailedDescription,
    showCloseButton: true
  };
  const theme = modalTheme() as any;
  const styles: IDialogStyles = {
    root: {
    },
    main: {
      selectors: {
        '@media(min-width: 640px)': {
          maxWidth: props.maxWidth || 420
        },
        'p.ms-Dialog-title:empty': {
          display: 'none'
        }
      }
    }
  };

  // remove the following code once
  // office ui fabric completes the theme support work
  // on TextField etc, see
  // https://teams.microsoft.com/l/channel/19%3a86b094239256467da9dfa96ba0897ca2%40thread.skype/Fabric%2520React?groupId=ffe264f2-14d0-48b5-9384-64f808b81294&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47
  loadTheme(theme);

  return (
    <Dialog
      hidden={false}
      dialogContentProps={content}
      modalProps={{ isBlocking: true, className: props.className }}
      onDismiss={props.cancel}
      styles={styles}
      theme={theme}
    >
      {props.children}
    </Dialog>
  );
}
