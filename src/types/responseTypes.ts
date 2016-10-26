

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
export function CreateResourceResponse(id: string): IResourceResponse {
    return { id: id };
}

// Create IErrorResponse object
export function CreateErrorResponse(code: string, message: string): IErrorResponse {
    return {
        error: {
            code: code,
            message: message
        }
    };
}

// Create Exception
export function CreateAPIException(statusCode: number, code: string, message: string): APIException {
    return {
        statusCode: statusCode,
        error: CreateErrorResponse(code, message)
    };
}