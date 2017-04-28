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
import * as ReactDOM from 'react-dom';
import * as Splitter from 'react-split-pane';
import * as Payment from '../../types/paymentTypes';
import * as Electron from 'electron';
import { SelectShippingMethod } from './selectShippingMethod';
import { SelectShippingAddress } from './selectShippingAddress';
import { SelectCreditCard } from './selectCreditCard';
import { AddCreditCardView } from './addCreditCardView';
import { AddShippingAddressView } from './addShippingAddressView';
import { PaymentDetails } from './paymentDetails';
import { IWalletViewState, IWalletShippingAddress, IWalletCreditCard, PaymentTypeConverter } from './walletTypes';
import { Emulator } from '../emulator';
import { ISettings } from '../settings';
import { ConversationActions, ServerSettingsActions } from '../reducers';

const remote = require('electron').remote;

export class WalletView extends React.Component<{}, IWalletViewState> {
    private local: IWalletViewState;
    private settings: ISettings;

    constructor(props) {
        super(props);
        let param = location.search;
        let paymentRequest;
        if (param) {
            if(param.startsWith('?')) {
                param = param.substring(1);
            }
            paymentRequest = JSON.parse(decodeURI(param)) as Payment.IPaymentRequest;
        }

        this.local = {
            paymentRequest: paymentRequest,
            selectedCreditCard: undefined,
            creditCards: [
                {
                    cardholderName: 'Jeffrey M. Derstadt',
                    cardNumber: '1234-5678-9012-3456',
                    expiresMonth: '10',
                    expiresYear: '19',
                    cvv: '123',
                    addressLine: '21514 SE 39th St.',
                    city: 'Sammamish',
                    state: 'WA',
                    postalCode: '98075',
                    countryOrRegion: 'US'
                },
                {
                    cardholderName: 'Jeffrey M. Derstadt',
                    cardNumber: '1111-2222-3333-4444',
                    expiresMonth: '03',
                    expiresYear: '21',
                    cvv: '999',
                    addressLine: '21514 SE 39th St.',
                    city: 'Sammamish',
                    state: 'WA',
                    postalCode: '98075',
                    countryOrRegion: 'US'
                }
            ],
            selectedShippingAddress: undefined,
            shippingAddresses: [
                {
                    recipient: 'Jeff Derstadt',
                    addressLine1: '21514 SE 39th St.',
                    addressLine2: undefined,
                    city: 'Sammamish',
                    state: 'WA',
                    postalCode:'98075',
                    countryOrRegion: 'US',
                    phoneNumber: '425-891-1803'
                },
                {
                    recipient: 'Jeff Derstadt',
                    addressLine1: '7630 SW Fir St',
                    addressLine2: undefined,
                    city: 'Tigard',
                    state: 'OR',
                    postalCode:'97223',
                    countryOrRegion: 'US',
                    phoneNumber: '425-891-1803'
                }
            ],
            emailAddress: '',
            phoneNumber: '',
            selectCreditCardIsVisible: false,
            selectShippingAddressIsVisible: false,
            selectShippingMethodIsVisible: false,
            addCreditCardIsVisible: false,
            addShippingAddressIsVisible: false
        };
        this.state = this.local;

        this.emailChanged = this.emailChanged.bind(this);
        this.phoneChanged = this.phoneChanged.bind(this);
        
        this.setShippingMethodSelectorIsVisible = this.setShippingMethodSelectorIsVisible.bind(this);
        this.getShippingMethodSelectorIsVisible = this.getShippingMethodSelectorIsVisible.bind(this);
        this.getSelectedShippingMethod = this.getSelectedShippingMethod.bind(this);
        this.selectShippingMethod = this.selectShippingMethod.bind(this);

        this.setShippingAddressSelectorIsVisible = this.setShippingAddressSelectorIsVisible.bind(this);
        this.getShippingAddressSelectorIsVisible = this.getShippingAddressSelectorIsVisible.bind(this);
        this.getSelectedShippingAddress = this.getSelectedShippingAddress.bind(this);
        this.selectShippingAddress = this.selectShippingAddress.bind(this);
        this.addShippingAddress = this.addShippingAddress.bind(this);
        this.onSaveShippingAddress = this.onSaveShippingAddress.bind(this);
        this.onCancelAddShippingAddress = this.onCancelAddShippingAddress.bind(this);

        this.setCreditCardSelectorIsVisible = this.setCreditCardSelectorIsVisible.bind(this);
        this.getCreditCardSelectorIsVisible = this.getCreditCardSelectorIsVisible.bind(this);
        this.getSelectedCreditCard = this.getSelectedCreditCard.bind(this);
        this.selectCreditCard = this.selectCreditCard.bind(this);
        this.addCreditCard = this.addCreditCard.bind(this);
        this.onSaveCreditCard = this.onSaveCreditCard.bind(this);
        this.onCancelAddCreditCard = this.onCancelAddCreditCard.bind(this);

        this.pay = this.pay.bind(this);

        this.onPageMouseDown = this.onPageMouseDown.bind(this);

        let walletState: any = Electron.ipcRenderer.sendSync('getWalletState');
        this.settings = walletState.settings;
        Emulator.serviceUrl = walletState.serviceUrl;
        ConversationActions.joinConversation(this.settings.conversation.conversationId);
        ServerSettingsActions.set(this.settings.serverSettings);
    }

    private emailChanged(text: string): void {
        this.updateState({ emailAddress: text });
    }

    private phoneChanged(text: string): void {
        this.updateState({ phoneNumber: text });
    }

    private setShippingAddressSelectorIsVisible(isVisible: boolean) {
        if(isVisible) {
            this.setCreditCardSelectorIsVisible(false);
            this.setShippingMethodSelectorIsVisible(false);
        }
        this.updateState({ selectShippingAddressIsVisible: isVisible});
    }

    private getShippingAddressSelectorIsVisible(): boolean {
        return this.state.selectShippingAddressIsVisible;
    }

    private getSelectedShippingAddress() {
        return this.state.selectedShippingAddress
    }

    private selectShippingAddress(value: IWalletShippingAddress) {
        this.updateState({ selectedShippingAddress: value});
        let shippingOption = this.getSelectedShippingMethod();
        Emulator.updateShippingAddress(
            this.state.paymentRequest, 
            PaymentTypeConverter.convertAddress(value),
            shippingOption ? shippingOption.id : undefined,
            (err, statusCode: number, result: Payment.IPaymentRequestUpdateResult) => {
                if (!err && result && result.details) {
                    this.updatePaymentDetails(result.details);
                }
            });
    }

    private addShippingAddress() {
        this.updateState({ addShippingAddressIsVisible: true });
    }

    private onSaveShippingAddress(item: IWalletShippingAddress) {
        this.local.shippingAddresses.push(item);
        this.local.selectedShippingAddress = item;
        this.local.addShippingAddressIsVisible = false;
        this.updateState(this.local);
    }

    private onCancelAddShippingAddress() {
        this.updateState({ addShippingAddressIsVisible: false });
    }

    private setShippingMethodSelectorIsVisible(isVisible: boolean) {
        if(isVisible) {
            this.setCreditCardSelectorIsVisible(false);
            this.setShippingAddressSelectorIsVisible(false);
        }
        this.updateState({ selectShippingMethodIsVisible: isVisible});
    }

    private getShippingMethodSelectorIsVisible(): boolean {
        return this.state.selectShippingMethodIsVisible;
    }

    private getSelectedShippingMethod() {
        if (this.state.paymentRequest.details.shippingOptions) {
            let selected = this.state.paymentRequest.details.shippingOptions.filter(option => option.selected);
            return selected && selected.length >= 1 ? selected[0] : undefined;
        }
        return undefined;
    }

    private selectShippingMethod(value: Payment.IPaymentShippingOption) {
        if (this.local.paymentRequest.details.shippingOptions) {
            this.local.paymentRequest.details.shippingOptions.forEach(option => {
                if (option.id === value.id) {
                    option.selected = true;
                } else {
                    option.selected = false;
                }
            });
        }
        
        this.updatePaymentDetails(this.local.paymentRequest.details);

        Emulator.updateShippingOption(
            this.local.paymentRequest, 
            PaymentTypeConverter.convertAddress(this.local.selectedShippingAddress),
            value.id, 
            (err, statusCode: number, result: Payment.IPaymentRequestUpdateResult) => {
                if (!err && result && result.details) {
                    this.updatePaymentDetails(result.details);
                }
            });
    }

    private setCreditCardSelectorIsVisible(isVisible: boolean) {
        if(isVisible) {
            this.setShippingMethodSelectorIsVisible(false);
            this.setShippingAddressSelectorIsVisible(false);
        }
        this.updateState({ selectCreditCardIsVisible: isVisible});
    }

    private getCreditCardSelectorIsVisible(): boolean {
        return this.state.selectCreditCardIsVisible;
    }

    private getSelectedCreditCard() {
        return this.state.selectedCreditCard
    }

    private selectCreditCard(value: IWalletCreditCard) {
        this.updateState({ selectedCreditCard: value});
    }

    private addCreditCard() {
        this.updateState({ addCreditCardIsVisible: true });
    }

    private onSaveCreditCard(item: IWalletCreditCard) {
        this.local.creditCards.push(item);
        this.local.selectedCreditCard = item;
        this.local.addCreditCardIsVisible = false;
        this.updateState(this.local);
    }

    private onCancelAddCreditCard() {
        this.updateState({ addCreditCardIsVisible: false });
    }

    private pay() {
        let shippingOption = this.getSelectedShippingMethod();
        Emulator.paymentComplete(
            this.state.paymentRequest,
            PaymentTypeConverter.convertAddress(this.state.selectedShippingAddress),
            shippingOption ? shippingOption.id : '',
            this.state.emailAddress,
            this.state.phoneNumber,
            (err, statusCode: number, body: Payment.IPaymentRequestCompleteResult) => {
                console.log(body.result);
                if(body.result === 'success') {
                    window.close();
                }
            });
    }

    private onPageMouseDown(evt: any) {
        const selectShippingMethod = ReactDOM.findDOMNode(this.refs['select-shipping-method']);
        if (!selectShippingMethod.contains(evt.target as Node) && this.state.selectShippingMethodIsVisible) {
            this.setShippingMethodSelectorIsVisible(false);
        }

        const selectShippingAddress = ReactDOM.findDOMNode(this.refs['select-shipping-address']);
        if (!selectShippingAddress.contains(evt.target as Node) && this.state.selectShippingAddressIsVisible) {
            this.setShippingAddressSelectorIsVisible(false);
        }

        const selectCreditCard = ReactDOM.findDOMNode(this.refs['select-credit-card']);
        if (!selectCreditCard.contains(evt.target as Node) && this.state.selectCreditCardIsVisible) {
            this.setCreditCardSelectorIsVisible(false);
        }
    }

    private updatePaymentDetails(details: Payment.IPaymentDetails) {
        this.local.paymentRequest.details = details;
        this.setState(this.local);
    }
    
    private updateState(update: any) {
        this.local = Object.assign({}, this.local, update);
        this.setState(this.local);
    }

    render() {
        if (this.state.addCreditCardIsVisible) {
            return (
                <div className='wallet-container'>
                    <AddCreditCardView
                        onSave={this.onSaveCreditCard}
                        onCancel={this.onCancelAddCreditCard}/>
                </div>);
        } else if (this.state.addShippingAddressIsVisible) {
            return (
                <div className='wallet-container'>
                    <AddShippingAddressView
                        onSave={this.onSaveShippingAddress}
                        onCancel={this.onCancelAddShippingAddress}/>
                </div>);
        } else {
            return (
                <div className='wallet-container' onMouseDown={this.onPageMouseDown}>
                    <div className='wallet-table'>
                        <div className='title fixed-right'>Confirm and Pay</div>
                        <div className='wallet-form'>
                            <div className='pay-with wallet-field'>
                                <div className='wallet-label'>Pay with</div>
                                <SelectCreditCard
                                    ref='select-credit-card'
                                    getIsVisible={this.getCreditCardSelectorIsVisible}
                                    setIsVisible={this.setCreditCardSelectorIsVisible}
                                    items={this.state.creditCards}
                                    getSelectedItem={this.getSelectedCreditCard}
                                    selectItem={this.selectCreditCard}
                                    placeholder='Select a way to pay'
                                    addItemLabel='+ Add a new way to pay'
                                    onClickAddItem={this.addCreditCard} />
                            </div>
                            <div className='ship-to wallet-field'>
                                <div className='wallet-label'>Ship to</div>
                                <SelectShippingAddress
                                    ref='select-shipping-address'
                                    getIsVisible={this.getShippingAddressSelectorIsVisible}
                                    setIsVisible={this.setShippingAddressSelectorIsVisible}
                                    items={this.state.shippingAddresses}
                                    getSelectedItem={this.getSelectedShippingAddress}
                                    selectItem={this.selectShippingAddress}
                                    placeholder='Select a shipping address'
                                    addItemLabel='+ Add a new shipping address'
                                    onClickAddItem={this.addShippingAddress} />
                            </div>
                            <div className='shipping-options wallet-field'>
                                <div className='wallet-label'>Shipping options</div>
                                <SelectShippingMethod
                                    ref='select-shipping-method'
                                    getIsVisible={this.getShippingMethodSelectorIsVisible}
                                    setIsVisible={this.setShippingMethodSelectorIsVisible}
                                    items={this.state.paymentRequest.details.shippingOptions}
                                    getSelectedItem={this.getSelectedShippingMethod}
                                    selectItem={this.selectShippingMethod} />
                            </div>
                            <div className='email-receipt-to wallet-field'>
                                <div className='wallet-label'>Email receipt to</div>
                                <input
                                    type="text"
                                    className="wallet-input"
                                    value={this.state.emailAddress}
                                    onChange={e => this.emailChanged((e.target as any).value)} />
                            </div>
                            <div className='phone wallet-field'>
                                <div className='wallet-label'>Phone</div>
                                <input
                                    type="text"
                                    className="wallet-input"
                                    value={this.state.phoneNumber}
                                    onChange={e => this.phoneChanged((e.target as any).value)} />

                            </div>
                            <PaymentDetails details={this.state.paymentRequest.details} />
                        </div>
                        <div className='total-container fixed-right'>
                            <div className='button pay-button' onClick={this.pay}>Pay</div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
