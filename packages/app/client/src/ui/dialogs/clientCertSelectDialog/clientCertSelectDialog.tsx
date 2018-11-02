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

import { Certificate } from 'electron';
import * as React from 'react';
import { Component } from 'react';
import { Dialog, DefaultButton, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './clientCertSelectDialog.scss';
import * as dialogStyles from '../dialogStyles.scss';

export interface ClientCertSelectDialogState {
    selectedIndex: number;
}

export interface ClientCertSelectDialogProps {
  dismiss?: (cert: Certificate | React.MouseEvent<any>) => any;
  certs?: Certificate[];
}

export class ClientCertSelectDialog extends Component<ClientCertSelectDialogProps, ClientCertSelectDialogState> {

  constructor(props: ClientCertSelectDialogProps = {} as any, state: ClientCertSelectDialogState) {
    super(props, state);
    this.state = { selectedIndex: -1 };
  }

  public render() {
    const { selectedIndex } = this.state;
    return (
      <Dialog 
        cancel={ this.props.dismiss } 
        className={ dialogStyles.dialogMedium }
        title="Select a certificate" 
      >
        <p>Select a certificate to authenticate to ????</p>
        <ul className={ styles.certList } role="listbox">
            {
              this.props.certs.map((cert, index) => {
                return (
                  <li 
                    aria-selected={ selectedIndex === index }
                    className={ selectedIndex === index ? styles.selectedCert : ''}
                    data-index={ index } 
                    key={ index } 
                    onClick={ this.onCertListItemClick } 
                    role="option"
                  >
                    <div className={ styles.certIcon } />
                    <div className={ styles.certInfo }>
                      <dl>
                        <dt>Subject:</dt>
                        <dd>{cert.subjectName}</dd>
                      </dl>
                      <dl>
                        <dt>Issuer:</dt>
                        <dd>{cert.issuerName}</dd>
                      </dl>
                      <dl>
                        <dt>Serial:</dt>
                        <dd>{cert.serialNumber}</dd>
                      </dl>
                    </div>
                  </li>
                );
              })
            } 
        </ul>
        <DialogFooter>
          <DefaultButton 
            text="Cancel" 
            onClick={ this.props.dismiss }
          />
          <PrimaryButton
            text="OK"
            onClick={ this.onDismissClick }
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private onDismissClick = () => {
      const cert = this.props.certs[this.state.selectedIndex];
      this.props.dismiss(cert);
  }

  private onCertListItemClick = (event: React.MouseEvent<HTMLLIElement>) => {
    const { index } = event.currentTarget.dataset;
    this.setState({
      selectedIndex: +index
    });
  }
}
