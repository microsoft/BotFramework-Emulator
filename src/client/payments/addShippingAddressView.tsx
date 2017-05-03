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
import { ICheckoutShippingAddress } from './checkoutTypes';
import { Button } from './button';

export class AddShippingAddressView extends React.Component<{
    onSave: (item: ICheckoutShippingAddress) => void,
    onCancel: () => void
}, ICheckoutShippingAddress> {
    constructor(props) {
        super(props);
        this.state = {
            recipient: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            countryOrRegion: '',
            phoneNumber: ''
        };

        this.recipientChanged = this.recipientChanged.bind(this);
        this.addressLine1Changed = this.addressLine1Changed.bind(this);
        this.addressLine2Changed = this.addressLine2Changed.bind(this);
        this.cityChanged = this.cityChanged.bind(this);
        this.stateChanged = this.stateChanged.bind(this);
        this.postalCodeChanged = this.postalCodeChanged.bind(this);
        this.countryChanged = this.countryChanged.bind(this);
        this.phoneNumberChanged = this.phoneNumberChanged.bind(this);
    }

    private recipientChanged(text: string): void {
        this.updateState({recipient: text});
    }

    private addressLine1Changed(text: string): void {
        this.updateState({addressLine1: text});
    }

    private addressLine2Changed(text: string): void {
        this.updateState({addressLine2: text});
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

    private phoneNumberChanged(text: string): void {
        this.updateState({phoneNumber: text});
    }

    private updateState(update: any) {
        this.setState(Object.assign({}, this.state, update));
    }

    render() {
        return (
            <div className='add-shipping-address-container checkout-table'>
                <div className='title fixed-right'>Emulating: Add a new shipping address</div>
                <div className='checkout-form'>
                    <div className='recipient checkout-field'>
                        <div className='checkout-label'>Recipient</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.recipientChanged((e.target as any).value)} />
                    </div>
                    <div className='street-address checkout-field'>
                        <div className='checkout-label'>Street address</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.addressLine1Changed((e.target as any).value)} />
                    </div>
                    <div className='street-address checkout-field'>
                        <div className='checkout-label'>Address line 2</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.addressLine2Changed((e.target as any).value)} />
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
                    <div className='phone-number checkout-field'>
                        <div className='checkout-label'>Phone number</div>
                        <input
                            type="text"
                            className="checkout-input"
                            onChange={e => this.phoneNumberChanged((e.target as any).value)} />
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

