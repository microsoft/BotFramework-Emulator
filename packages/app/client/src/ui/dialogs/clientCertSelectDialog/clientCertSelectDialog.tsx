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
