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

import * as request from 'request';
import * as http from 'http';
import { getSettings } from './settings';
import * as Payment from '../types/paymentTypes';

export class Emulator {
    public static serviceUrl: string;

    public static addUser(name?: string, id?: string) {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/users`,
            method: "POST",
            json: [{ name, id }]
        };
        request(options);
    }

    public static removeUser(id: string) {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/users`,
            method: "DELETE",
            json: [{ id }]
        };
        request(options);
    }

    public static removeRandomUser() {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/users`,
            method: "DELETE"
        };
        request(options);
    }

    public static botContactAdded() {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/contacts`,
            method: "POST"
        };
        request(options);
    }

    public static botContactRemoved() {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/contacts`,
            method: "DELETE"
        };
        request(options);
    }

    public static typing() {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/typing`,
            method: "POST"
        };
        request(options);
    }

    public static ping() {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/ping`,
            method: "POST"
        };
        request(options);
    }

    public static deleteUserData() {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/userdata`,
            method: "DELETE"
        };
        request(options);
    }

    public static updateShippingAddress(
            checkoutSession: Payment.ICheckoutConversationSession,
            paymentRequest: Payment.IPaymentRequest,
            shippingAddress: Payment.IPaymentAddress,
            shippingOptionId: string,
            cb: (err, statusCode: number, body: Payment.IPaymentRequestUpdateResult) => void) {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/invoke/updateShippingAddress`,
            method: "POST",
            json: [{ checkoutSession: checkoutSession, request: paymentRequest, shippingAddress: shippingAddress, shippingOptionId: shippingOptionId }],
        };
        let responseCallback = (err, resp: http.IncomingMessage, body) => {
            cb(err, resp.statusCode, body as Payment.IPaymentRequestUpdateResult);
        };
        request(options, responseCallback);
    }

    public static updateShippingOption(
            checkoutSession: Payment.ICheckoutConversationSession,
            paymentRequest: Payment.IPaymentRequest,
            shippingAddress: Payment.IPaymentAddress,
            shippingOptionId: string,
            cb: (err, statusCode: number, body: Payment.IPaymentRequestUpdateResult) => void) {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/invoke/updateShippingOption`,
            method: "POST",
            json: [{ checkoutSession: checkoutSession, request: paymentRequest, shippingAddress: shippingAddress, shippingOptionId: shippingOptionId }],
        };
        let responseCallback = (err, resp: http.IncomingMessage, body) => {
            cb(err, resp.statusCode, body as Payment.IPaymentRequestUpdateResult);
        };
        request(options, responseCallback);
    }

    public static paymentComplete(
            checkoutSession: Payment.ICheckoutConversationSession,
            paymentRequest: Payment.IPaymentRequest,
            shippingAddress: Payment.IPaymentAddress,
            shippingOptionId: string,
            payerEmail: string,
            payerPhone: string,
            cb: (err, statusCode: number, body: Payment.IPaymentRequestCompleteResult) => void) {
        const settings = getSettings();
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/${settings.conversation.conversationId}/invoke/paymentComplete`,
            method: "POST",
            json: [{ checkoutSession: checkoutSession, request: paymentRequest, shippingAddress: shippingAddress, shippingOptionId: shippingOptionId, payerEmail: payerEmail, payerPhone: payerPhone }],
        };
        let responseCallback = (err, resp: http.IncomingMessage, body) => {
            cb(err, resp.statusCode, body as Payment.IPaymentRequestCompleteResult);
        };
        request(options, responseCallback);
    }

    public static zoomIn() {
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/window/zoomIn`,
            method: "POST"
        };
        request(options);
    }
    public static zoomOut() {
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/window/zoomOut`,
            method: "POST"
        };
        request(options);
    }
    public static zoomReset() {
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/window/zoomReset`,
            method: "POST"
        };
        request(options);
    }

    public static quitAndInstall() {
        let options: request.OptionsWithUrl = {
            url: `${this.serviceUrl}/emulator/system/quitAndInstall`,
            method: "POST"
        };
        request(options);
    }
}
