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
export function sendErrorResponse(req: Restify.Request, res: Restify.Response, next: Restify.Next, exception: any): any {
    let apiException: APIException = exception;
    if (apiException.error)
        res.send(apiException.statusCode, apiException.error);
    else
        res.send(HttpStatus.BAD_REQUEST, createErrorResponse(ErrorCodes.ServiceError, exception.message));
    res.end();
}
