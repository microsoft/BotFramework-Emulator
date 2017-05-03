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

import * as Payment from '../../types/paymentTypes';

export interface ICheckoutCreditCard {
    cardholderName: string;
    cardNumber: string;
    expiresMonth: string;
    expiresYear: string;
    cvv: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    countryOrRegion: string;
}

export interface ICheckoutShippingAddress {
    recipient: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    countryOrRegion: string;
    phoneNumber: string;
}

export interface ICheckoutViewState {
    // payment request
    paymentRequest: Payment.IPaymentRequest;

    // payment type
    selectedCreditCard: ICheckoutCreditCard;
    creditCards: ICheckoutCreditCard[];

    // shipping destination
    selectedShippingAddress: ICheckoutShippingAddress;
    shippingAddresses: ICheckoutShippingAddress[];

    // contact information
    emailAddress: string;
    phoneNumber: string;

    // selection state
    selectCreditCardIsVisible: boolean;
    selectShippingAddressIsVisible: boolean;
    selectShippingMethodIsVisible: boolean;

    // add panels
    addCreditCardIsVisible: boolean;
    addShippingAddressIsVisible: boolean;

    // validation mode
    isInValidationMode: boolean;
}

export class PaymentTypeConverter {
    public static convertAddress(address: ICheckoutShippingAddress): Payment.IPaymentAddress {
        let converted: Payment.IPaymentAddress = {
            addressLine: [],
            city: address.city,
            country: address.countryOrRegion,
            dependentLocality: '',
            languageCode: '',
            organization: '',
            phone: address.phoneNumber,
            postalCode: address.postalCode,
            recipient: address.recipient,
            region: address.state,
            sortingCode: ''
        };

        converted.addressLine.push(address.addressLine1);
        if (address.addressLine2) {
            converted.addressLine.push(address.addressLine2);
        }

        return converted;
    }
}
