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

export interface CheckoutConversationSession {
  paymentActivityId: string;
  checkoutConversationId: string;
  checkoutFromId: string;
}

export interface PaymentMethodData {
  supportedMethods: string[];
  data: any;
}

export interface PaymentDetails {
  total: PaymentItem;
  displayItems: PaymentItem[];
  shippingOptions: PaymentShippingOption[];
  modifiers: PaymentDetailsModifier[];
  error: string;
}

export interface PaymentItem {
  label: string;
  pending?: boolean;
  amount: PaymentCurrencyAmount;
}

export interface PaymentCurrencyAmount {
  currency: string;
  currencySystem: string;
  value: string;
}

export interface PaymentDetailsModifier {
  additionalDisplayItems: PaymentItem[];
  data: any;
  supportedMethods: string[];
  total: PaymentItem;
}

export interface PaymentShippingOption {
  id: string;
  label: string;
  selected?: boolean;
  amount: PaymentCurrencyAmount;
}

export interface PaymentOptions {
  requestPayerEmail?: boolean;
  requestPayerName?: boolean;
  requestPayerPhone?: boolean;
  requestShipping?: boolean;
  shippingType: string;
}

export interface PaymentRequest {
  details: PaymentDetails;
  expires: string;
  id: string;
  methodData: PaymentMethodData[];
  options: PaymentOptions;
}

export const PaymentOperations = {
  PaymentCompleteOperationName: "payments/complete",
  UpdateShippingAddressOperationName: "payments/update/shippingAddress",
  UpdateShippingOptionOperationName: "payments/update/shippingOption"
};

export interface PaymentAddress {
  addressLine: string[];
  city: string;
  country: string;
  dependentLocality: string;
  languageCode: string;
  organization: string;
  phone: string;
  postalCode: string;
  recipient: string;
  region: string;
  sortingCode: string;
}

export interface PaymentRequestUpdate {
  details: PaymentDetails;
  id: string;
  shippingAddress: PaymentAddress;
  shippingOption: string;
}

export interface PaymentRequestUpdateResult {
  details: PaymentDetails;
}

export interface PaymentRequestComplete {
  id: string;
  paymentRequest: PaymentRequest;
  paymentResponse: PaymentResponse;
}

export interface PaymentRequestCompleteResult {
  result: string;
}

export interface PaymentResponse {
  details: any;
  methodName: string;
  payerEmail: string;
  payerPhone: string;
  shippingAddress: PaymentAddress;
  shippingOption: string;
}
