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
import * as Splitter from 'react-split-pane';
import * as Payment from '../../types/paymentTypes';

const remote = require('electron').remote;

export class PaymentView extends React.Component<{}, {}> {
    private paymentRequest: Payment.IPaymentRequest;

    private emailAddress: string;
    private phoneNumber: string;

    componentWillMount() {
        let param = location.search;
        if (param) {
            if(param.startsWith('?')) {
                param = param.substring(1);
            }
            this.paymentRequest = JSON.parse(decodeURI(param)) as Payment.IPaymentRequest;
        }
    }

    emailChanged = (text: string) => {
        this.emailAddress = text.trim();
    }

    phoneChanged = (text: string) => {
        this.phoneNumber = text.trim();
    }

    render() {
        return (
            <div className='payment-container'>
                <div className='title fixed-right'>Confirm and Pay</div>

                <div className='pay-with pay-field'>
                    <div className='payment-label'>Pay with</div>
                    <div className='selector'></div>
                </div>
                <div className='ship-to pay-field'>
                    <div className='payment-label'>Ship to</div>
                    <div className='selector'></div>
                </div>
                <div className='shipping-options pay-field'>
                    <div className='payment-label'>Shipping options</div>
                    <div className='selector'></div>
                </div>
                <div className='email-receipt-to pay-field'>
                    <div className='payment-label'>Email receipt to</div>
                    <input
                        type="text"
                        className="selector"
                        value={this.emailAddress}
                        onChange={e => this.emailChanged((e.target as any).value)} />
                </div>
                <div className='phone pay-field'>
                    <div className='payment-label'>Phone</div>
                    <input
                        type="text"
                        className="selector"
                        value={this.phoneNumber}
                        onChange={e => this.phoneChanged((e.target as any).value)} />

                </div>
                <div className='total-container fixed-right'>
                </div>
                <div className='pay-button fixed-right'>Pay</div>
                <Selector/>
            </div>
        );
    }

    
}

interface ISelectorItem {
    label: string;
    action?: () => void;
}

class SelectorItem extends React.Component<ISelectorItem, {}> {
    constructor(props) {
        super(props);
    
        this.select = this.select.bind(this);
    }

    select(e) {
        e.preventDefault();
        if (this.props.action) {
            this.props.action();
        }
    }

    render() {
        return (
            <div onClick={this.select}>{this.props.label}</div>
        );
    }
}

interface IAddress {
    recipient?: string;
    streetLine1?: string;
    streetLine2?: string;
    city?: string;
    state?: string;
    zip?: string;
}


class AddressItem extends React.Component<{address: IAddress},{}> {
    constructor(props) {
        super(props);
    }

    render() {
        let addr2 = this.props.address.streetLine2 ? 
                <div>{this.props.address.streetLine2}</div> :
                undefined;

        return (
            <div>
                <div>{this.props.address.recipient}</div>
                <div>{this.props.address.streetLine1}</div>
                {addr2}
                <div>{this.props.address.city}, {this.props.address.state} {this.props.address.zip}</div>
            </div>);
    }
}

class Selector extends React.Component<{}, {isExpanded: boolean}> {
    
    constructor(props) {
        super(props);

        this.state = {
            isExpanded: false
        };

        this.toggle = this.toggle.bind(this);
    }

    render() {
        let items: ISelectorItem[] = [
            {label: 'One'},
            {label: 'Two'}
        ];
    
        let addressItems = [{
            class: AddressItem,
            value: {
                address: {
                    recipient: 'Jeff',
                    streetLine1: '21514 SE 39th St',
                    city: 'Sammamish',
                    state: 'WA',
                    zip: '98075'
                }
            }
        },
        {
            class: AddressItem,
            value: {
                address: {
                    recipient: 'Rob',
                    streetLine1: '123 Main St',
                    streetLine2: 'Apr 5',
                    city: 'Denver',
                    state: 'CO',
                    zip: '87612'
                }
            }
        }];

        let renderItems = [];

        addressItems.forEach(ri => 
            renderItems.push(React.createElement(ri.class, ri.value)));

        let contents = undefined;
        if (this.state.isExpanded) {
            contents = (<div className='selector-items grow'>
                {renderItems}
            </div>);
        } else {
            contents = (<div className='selector-items shrink'>
                {renderItems}
            </div>);
        }
        

        return (<div className='selector-container'>
                    <div className='label' onClick={this.toggle}>This is the menu</div>
                    {contents}
                </div>);
    }

    toggle(e) {
        this.setState((prevState, props) => {
            return {isExpanded: !prevState.isExpanded};
        });
    }
}
