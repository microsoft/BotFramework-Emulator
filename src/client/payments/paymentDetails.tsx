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
import * as Payment from '../../types/paymentTypes';


export class PaymentDetails extends React.Component<
    { details: Payment.IPaymentDetails }, 
    { detailsAreVisible: boolean }> {

    constructor(props) {
        super(props);
        this.state = { detailsAreVisible: false };

        this.toggleDetails = this.toggleDetails.bind(this);
    }

    private toggleDetails(evt) {
        this.updateState({ detailsAreVisible: !this.state.detailsAreVisible });
    }

    private updateState(update: any) {
        this.setState(Object.assign({}, this.state, update));
    }

    render() {
        let details = undefined;
        if (this.state.detailsAreVisible) {
            let items = [];
            let idx = 0;
            this.props.details.displayItems.forEach(item => {
                items.push(
                    <div className='line-item' key={idx}>
                        <div className='item-label'>{item.label}</div>
                        <div className='item-value'>{item.pending ? '*' : '' }${item.amount.value}</div>
                    </div>
                );
                idx++;
            });
            details = (
                <div className='line-items'>
                    {items}
                </div>
            );
        }

        return (
                <div className='total-container fixed-right'>
                    {details}
                    <div className='total-line'>
                        <div className='total-label-container'>
                            <div className='total-label'>Total ({this.props.details.total.amount.currency})</div>
                            <div className='show-details' onClick={this.toggleDetails}>{(this.state.detailsAreVisible ? 'Hide' : 'Show') + ' details'}</div>
                        </div>
                        <div className='total-value'>{this.props.details.total.pending ? '*' : '' }${this.props.details.total.amount.value}</div>
                    </div>
                    <div className='total-line not-final'>* - Indicates the cost isn't final</div>
                </div>
            );
    }
}
