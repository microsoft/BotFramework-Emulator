import { APIException } from "@bfemulator/app-shared";
import * as HttpStatus from "http-status-codes";
import { exceptionToAPIException } from "./exceptionToAPIException";

describe("The exceptionToAPIException", () => {
  it("should pass an APIException though unchanged", () => {
    const apiException: APIException = {
      error: { error: { code: "42", message: "oh noes!" } },
      statusCode: HttpStatus.BAD_REQUEST
    };

    expect(exceptionToAPIException(apiException)).toBe(apiException);
  });

  it("should convert an exception to an APIException", () => {
    const error = new Error("This is an error");
    expect(exceptionToAPIException(error)).toEqual({
      error: {
        error: {
          code: "ServiceError",
          message: "This is an error"
        }
      },
      statusCode: HttpStatus.BAD_REQUEST
    });
  });
});
