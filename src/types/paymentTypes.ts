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

export interface ICheckoutConversationSession {
    paymentActivityId: string;
    checkoutConversationId: string;
    checkoutFromId: string;
}

export interface IPaymentMethodData {
    supportedMethods: string[],
    data: any
}

export interface IPaymentDetails {
    total: IPaymentItem,
    displayItems: IPaymentItem[],
    shippingOptions: IPaymentShippingOption[],
    modifiers: IPaymentDetailsModifier[],
    error: string
}

export interface IPaymentItem {
    label: string,
    pending?: boolean,
    amount: IPaymentCurrencyAmount
}
  
export interface IPaymentCurrencyAmount {
    currency: string,
    currencySystem: string,
    value: string
}

export interface IPaymentDetailsModifier {
    additionalDisplayItems: IPaymentItem[],
    data: any,
    supportedMethods: string[],
    total: IPaymentItem
}

export interface IPaymentShippingOption {
    id: string,
    label: string,
    selected?: boolean,
    amount: IPaymentCurrencyAmount
}

export interface IPaymentOptions {
    requestPayerEmail?: boolean,
    requestPayerName?: boolean,
    requestPayerPhone?: boolean,
    requestShipping?: boolean,
    shippingType: string
}

export interface IPaymentRequest {
    details: IPaymentDetails,
    expires: string,
    id: string,
    methodData: IPaymentMethodData[],
    options: IPaymentOptions
}

export const PaymentOperations = {
    PaymentCompleteOperationName: 'payments/complete',
    UpdateShippingAddressOperationName: 'payments/update/shippingAddress',
    UpdateShippingOptionOperationName: 'payments/update/shippingOption'
}

export interface IPaymentAddress {
    addressLine: string[],
    city: string,
    country: string,
    dependentLocality: string,
    languageCode: string,
    organization: string,
    phone: string,
    postalCode: string,
    recipient: string,
    region: string,
    sortingCode: string
}

export interface IPaymentRequestUpdate {
    details: IPaymentDetails,
    id: string,
    shippingAddress: IPaymentAddress,
    shippingOption: string 
}

export interface IPaymentRequestUpdateResult {
    details: IPaymentDetails
}

export interface IPaymentRequestComplete {
    id: string,
    paymentRequest: IPaymentRequest,
    paymentResponse: IPaymentResponse
}

export interface IPaymentRequestCompleteResult {
    result: string;
}

export interface IPaymentResponse {
    details: any,
    methodName: string,
    payerEmail: string,
    payerPhone: string,
    shippingAddress: IPaymentAddress,
    shippingOption: string
}
