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

import * as Restify from 'restify';
import * as HttpStatus from "http-status-codes";


export interface IError {
    code?: string,
    message?: string,
}

export interface IErrorResponse {
    error: IError,
}

export interface IResourceResponse {
    id: string
}

export interface IConversationResourceResponse {
    id: string,
    activityId?: string
}


export const ErrorCodes = {
    /// unknown service error
    ServiceError: "ServiceError",

    /// Bad argument
    BadArgument: "BadArgument",

    /// Error parsing request
    BadSyntax: "BadSyntax",

    /// Mandatory property was not specified
    MissingProperty: "MissingProperty",

    /// Message exceeded size limits
    MessageSizeTooBig: "MessageSizeTooBig"
}

export interface APIException {
    statusCode: number;
    error: IErrorResponse;
}

//
// Create IResourceResponse object
//
export function createResourceResponse(id: string): IResourceResponse {
    return { id: id };
}

export function createConversationResponse(id: string, activityId:string ): IConversationResourceResponse {
    let response : IConversationResourceResponse =  {id: id};
    if (activityId != null)
        response.activityId = activityId;
    return response;
}

// Create IErrorResponse object
export function createErrorResponse(code: string, message: string): IErrorResponse {
    return {
        error: {
            code: code,
            message: message
        }
    };
}

// Create Exception
export function createAPIException(statusCode: number, code: string, message: string): APIException {
    return {
        statusCode: statusCode,
        error: createErrorResponse(code, message)
    };
}

// send exception as error response
export function sendErrorResponse(req: Restify.Request, res: Restify.Response, next: Restify.Next, exception: any): IErrorResponse {
    let apiException: APIException = exception;
    if (apiException.error) {
        res.send(apiException.statusCode, apiException.error);
        res.end();
        return apiException.error;
    }
    else{
        let error = createErrorResponse(ErrorCodes.ServiceError, exception.message);
        res.send(HttpStatus.BAD_REQUEST, error);
        res.end();
        return error;
    }
}
