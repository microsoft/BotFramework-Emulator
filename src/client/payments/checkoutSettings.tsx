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

import { ICheckoutCreditCard, ICheckoutShippingAddress } from './checkoutTypes';
import { loadSettings, saveSettings } from '../../shared/utils';

interface ICheckoutSettings {
    creditCards: ICheckoutCreditCard[];
    shippingAddresses: ICheckoutShippingAddress[];
    email: string;
    phoneNumber: string;
}

export class CheckoutSettings {
    private _settings: ICheckoutSettings = this.getSettings();
    private saveTimer;
        

    public getSettings() : ICheckoutSettings {
        if (!this._settings) {
            this._settings = loadSettings<ICheckoutSettings>('checkout.json', {
                creditCards: [],
                shippingAddresses: [],
                email: '',
                phoneNumber: ''
            });
        }
        return Object.assign({}, this._settings);
    }

    public updateEmail(email: string) {
        this._settings.email = email;
        this.saveCheckoutSettings();
    }

    public updatePhoneNumber(phoneNumber: string) {
        this._settings.phoneNumber = phoneNumber;
        this.saveCheckoutSettings();
    }

    public addCreditCard(creditCard: ICheckoutCreditCard) {
        this._settings.creditCards.push(creditCard);
        this.saveCheckoutSettings();
    }

    public removeCreditCard(creditCard: ICheckoutCreditCard) {
        let idx = this._settings.creditCards.indexOf(creditCard);
        if (idx !== 1) {
            this._settings.creditCards.splice(idx, 1);
            this.saveCheckoutSettings();
        }
    }

    public addShippingAddress(address: ICheckoutShippingAddress) {
        this._settings.shippingAddresses.push(address);
        this.saveCheckoutSettings();
    }

    public removeShippingAddress(address: ICheckoutShippingAddress) {
        let idx = this._settings.shippingAddresses.indexOf(address);
        if (idx !== 1) {
            this._settings.shippingAddresses.splice(idx, 1);
            this.saveCheckoutSettings();
        }
    }

    private saveCheckoutSettings() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = undefined;
        }

        this.saveTimer = setTimeout(() => {
            saveSettings('checkout.json', this._settings);
        }, 1000);
    }
}