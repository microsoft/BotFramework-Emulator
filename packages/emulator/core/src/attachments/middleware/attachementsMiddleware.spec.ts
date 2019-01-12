import getAttachment from "./getAttachment";
import Attachments from "../../facility/attachments";
import * as HttpStatus from "http-status-codes";
import getAttachmentInfo from "./getAttachmentInfo";

describe("The getAttachment middleware", () => {
  let facilities;
  let attachments;
  let attachmentId;
  beforeEach(() => {
    attachments = new Attachments();
    attachmentId = attachments.uploadAttachment({
      name: "an attachment",
      originalBase64: "aGk=",
      type: "application/text",
      thumbnailBase64: "aGk="
    });
    facilities = {
      attachments
    };
  });

  it("should get the specified attachment", () => {
    const getAttachmentMiddleware = getAttachment({ facilities } as any);

    const req = {
      params: {
        viewId: "thumbnail",
        attachmentId
      }
    };

    const res = {
      send: () => null,
      contentType: ""
    };

    const sendSpy = jest.spyOn(res, "send");

    getAttachmentMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(
      HttpStatus.OK,
      Buffer.from("aGk=", "base64")
    );
    expect(res.contentType).toBe("application/text");
  });

  it('should send an error response when the "originalBase64" and "thumbnailBase64" are falsy', () => {
    const getAttachmentMiddleware = getAttachment({ facilities } as any);
    (attachments as any).attachments[attachmentId].originalBase64 = undefined;
    (attachments as any).attachments[attachmentId].thumbnailBase64 = undefined;
    const req = {
      params: {
        viewId: "thumbnail",
        attachmentId
      }
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: ""
    };

    const sendSpy = jest.spyOn(res, "send");

    getAttachmentMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.NOT_FOUND, {
      error: {
        code: "BadArgument",
        message: "There is no thumbnail view"
      }
    });
    expect(res.contentType).toBe("");
  });
});

describe("the getAttachmentInfo middleware", () => {
  let facilities;
  let attachments;
  let attachmentId;
  beforeEach(() => {
    attachments = new Attachments();
    attachmentId = attachments.uploadAttachment({
      name: "an attachment",
      originalBase64: "aGk=",
      type: "application/text",
      thumbnailBase64: "aGk="
    });
    facilities = {
      attachments
    };
  });

  it("should get the attachment info when a valid request is made", () => {
    const getAttachmentInfoMiddleware = getAttachmentInfo({
      facilities
    } as any);
    const req = {
      params: {
        viewId: "thumbnail",
        attachmentId
      }
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: ""
    };
    const sendSpy = jest.spyOn(res, "send");

    getAttachmentInfoMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      name: "an attachment",
      type: "application/text",
      views: [{ size: 2, viewId: "original" }, { size: 2, viewId: "thumbnail" }]
    });
  });

  it("should send an error response when the attachment is not found", () => {
    const getAttachmentInfoMiddleware = getAttachmentInfo({
      facilities
    } as any);
    const req = {
      params: {
        viewId: "thumbnail",
        attachmentId: "not there"
      }
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: ""
    };
    const sendSpy = jest.spyOn(res, "send");

    getAttachmentInfoMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.NOT_FOUND, {
      error: {
        code: "BadArgument",
        message: "attachment[not there] not found"
      }
    });
  });
});
