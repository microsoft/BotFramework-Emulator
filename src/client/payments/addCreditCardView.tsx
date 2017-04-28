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
import { IWalletCreditCard } from './walletTypes';


export class AddCreditCardView extends React.Component<{
    onSave: (item: IWalletCreditCard) => void,
    onCancel: () => void
}, IWalletCreditCard> {
    constructor(props) {
        super(props);
        this.state = {
            cardholderName: '',
            cardNumber: '',
            expiresMonth: '',
            expiresYear: '',
            cvv: '',
            addressLine: '',
            city: '',
            state: '',
            postalCode: '',
            countryOrRegion: ''
        };

        this.cardholderNameChanged = this.cardholderNameChanged.bind(this);
        this.cardNumberChanged = this.cardNumberChanged.bind(this);
        this.expiresMonthChanged = this.expiresMonthChanged.bind(this);
        this.expiresYearChanged = this.expiresYearChanged.bind(this);
        this.cvvChanged = this.cvvChanged.bind(this);
        this.addressLineChanged = this.addressLineChanged.bind(this);
        this.cityChanged = this.cityChanged.bind(this);
        this.stateChanged = this.stateChanged.bind(this);
        this.postalCodeChanged = this.postalCodeChanged.bind(this);
        this.countryChanged = this.countryChanged.bind(this);
    }

    private cardholderNameChanged(text: string): void {
        this.updateState({cardholderName: text});
    }

    private cardNumberChanged(text: string): void {
        this.updateState({cardNumber: text});
    }

    private expiresMonthChanged(text: string): void {
        this.updateState({expiresMonth: text});
    }

    private expiresYearChanged(text: string): void {
        this.updateState({expiresYear: text});
    }

    private cvvChanged(text: string): void {
        this.updateState({cvv: text});
    }

    private addressLineChanged(text: string): void {
        this.updateState({addressLine: text});
    }

    private cityChanged(text: string): void {
        this.updateState({city: text});
    }

    private stateChanged(text: string): void {
        this.updateState({state: text});
    }

    private postalCodeChanged(text: string): void {
        this.updateState({postalCode: text});
    }

    private countryChanged(text: string): void {
        this.updateState({countryOrRegion: text});
    }

    private updateState(update: any) {
        this.setState(Object.assign({}, this.state, update));
    }

    render() {
        return (
            <div className='add-credit-card-container wallet-table'>
                <div className='title fixed-right'>Add a new credit or debit card</div>
                <div className='wallet-form'>
                    <div className='cardholder-name wallet-field'>
                        <div className='wallet-label'>Cardholder Name</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.cardholderNameChanged((e.target as any).value)} />
                    </div>
                    <div className='card-number wallet-field'>
                        <div className='wallet-label'>Card Number</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.cardNumberChanged((e.target as any).value)} />
                    </div>
                    <div className='expires-month wallet-field'>
                        <div className='wallet-label'>Expires</div>
                        <input
                            type="text"
                            className="wallet-input"
                            placeholder='MM'
                            onChange={e => this.expiresMonthChanged((e.target as any).value)} />
                        <input
                            type="text"
                            className="wallet-input"
                            placeholder='YY'
                            onChange={e => this.expiresYearChanged((e.target as any).value)} />
                    </div>
                    <div className='cvv wallet-field'>
                        <div className='wallet-label'>CVV</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.cvvChanged((e.target as any).value)} />
                    </div>
                    <div className='address-line-one wallet-field'>
                        <div className='wallet-label'>Address</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.addressLineChanged((e.target as any).value)} />
                    </div>
                    <div className='city wallet-field'>
                        <div className='wallet-label'>City</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.cityChanged((e.target as any).value)} />
                    </div>
                    <div className='state wallet-field'>
                        <div className='wallet-label'>State</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.stateChanged((e.target as any).value)} />
                    </div>
                    <div className='postal-code wallet-field'>
                        <div className='wallet-label'>Postal Code</div>
                        <input
                            type="text"
                            className="wallet-input postal-code-input"
                            onChange={e => this.postalCodeChanged((e.target as any).value)} />
                    </div>
                    <div className='country wallet-field'>
                        <div className='wallet-label'>Country/Region</div>
                        <input
                            type="text"
                            className="wallet-input"
                            onChange={e => this.countryChanged((e.target as any).value)} />
                    </div>
                </div>
                <div className='wallet-button-bar fixed-right'>
                    <div className='button cancel-button' onClick={() => this.props.onCancel()}>Cancel</div>
                    <div className='button save-button'onClick={() => this.props.onSave(this.state)}>Save</div>
                </div>
            </div>
        );
    }
}

