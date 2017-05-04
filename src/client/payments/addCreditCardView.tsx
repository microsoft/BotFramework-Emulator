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
import { ICheckoutCreditCard } from './checkoutTypes';
import { Button } from './button';


export class AddCreditCardView extends React.Component<{
    onSave: (item: ICheckoutCreditCard) => void,
    onCancel: () => void
}, ICheckoutCreditCard> {
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
            <div className='add-credit-card-container checkout-table'>
                <div className='title fixed-right'>Emulating: Add a new credit or debit card</div>
                <div className='checkout-form'>
                    <div className='cardholder-name checkout-field'>
                        <div className='checkout-label'>Cardholder Name</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.cardholderNameChanged((e.target as any).value)} />
                    </div>
                    <div className='card-number checkout-field'>
                        <div className='checkout-label'>Card Number</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.cardNumberChanged((e.target as any).value)} />
                    </div>
                    <div className='expires-month checkout-field'>
                        <div className='checkout-label'>Expires</div>
                        <input
                            type="text"
                            className="checkout-input"
                            placeholder='MM'
                            onChange={e => this.expiresMonthChanged((e.target as any).value)} />
                        <input
                            type="text"
                            className="checkout-input"
                            placeholder='YY'
                            onChange={e => this.expiresYearChanged((e.target as any).value)} />
                    </div>
                    <div className='cvv checkout-field'>
                        <div className='checkout-label'>CVV</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.cvvChanged((e.target as any).value)} />
                    </div>
                    <div className='address-line-one checkout-field'>
                        <div className='checkout-label'>Address</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.addressLineChanged((e.target as any).value)} />
                    </div>
                    <div className='city checkout-field'>
                        <div className='checkout-label'>City</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.cityChanged((e.target as any).value)} />
                    </div>
                    <div className='state checkout-field'>
                        <div className='checkout-label'>State</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.stateChanged((e.target as any).value)} />
                    </div>
                    <div className='postal-code checkout-field'>
                        <div className='checkout-label'>Postal Code</div>
                        <input
                            type="text"
                            className="checkout-input postal-code-input"
                            onChange={e => this.postalCodeChanged((e.target as any).value)} />
                    </div>
                    <div className='country checkout-field'>
                        <div className='checkout-label'>Country/Region</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.countryChanged((e.target as any).value)} />
                    </div>
                </div>
                <div className='checkout-button-bar fixed-right'>
                    <Button classes='secondary-button cancel-button' onClick={() => this.props.onCancel()} label='Cancel'/>
                    <Button classes='primary-button save-button' onClick={() => this.props.onSave(this.state)} label='Save'/>
                </div>
            </div>
        );
    }
}

