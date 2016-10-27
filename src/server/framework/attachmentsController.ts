import * as Restify from 'restify';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../types/responseTypes';
import { IAttachmentData, IAttachmentInfo, IAttachmentView } from '../../types/attachmentTypes';
import { uniqueId } from '../../utils';

interface IAttachmentParams {
    attachmentId: string;
    viewId: string;
}

export class AttachmentsController {

    private static attachments: { [key: string]: IAttachmentData } = {};

    public static registerRoutes(server: Restify.Server) {
        server.get('/v3/attachments/:attachmentId', this.getAttachmentInfo);
        server.get('/v3/attachments/:attachmentId/views/:viewId', this.getAttachment);
    }

    public static uploadAttachment(attachmentData: IAttachmentData): string {
        if (!attachmentData.type)
            throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, "You must specify type property for the attachment");
            
        if (!attachmentData.originalBase64)
            throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, "You must specify originalBase64 byte[] for the attachment");

        var attachment: any = attachmentData;
        attachment.id = uniqueId();
        AttachmentsController.attachments[attachment.id] = attachment;
        return attachment.id;
    }

    public static getAttachmentInfo(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            console.log("framework: getAttachmentInfo");
            const parms: IAttachmentParams = req.params;
            var attachment: IAttachmentData = AttachmentsController.attachments[parms.attachmentId];
            if (attachment) {
                var attachmentInfo: IAttachmentInfo = {
                    name: attachment.name,
                    type: attachment.type,
                    views: []
                }
                if (attachment.originalBase64)
                    attachmentInfo.views.push({
                        viewId: 'original', size: new Buffer(attachment.originalBase64, 'base64').length
                    });
                if (attachment.thumbnailBase64)
                    attachmentInfo.views.push({
                        viewId: 'thumbnail', size: new Buffer(attachment.thumbnailBase64, 'base64').length
                    });

                res.send(HttpStatus.OK, attachmentInfo);
                res.end();
            }
            else {
                res.send(HttpStatus.NOT_FOUND, ResponseTypes.createErrorResponse(ErrorCodes.BadArgument, `attachment[${parms.attachmentId}] not found`));
                res.end();
            }
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    public static getAttachment(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getAttachment");
        try {
            const parms: IAttachmentParams = req.params;
            var attachment: IAttachmentData = AttachmentsController.attachments[parms.attachmentId];
            if (attachment) {
                if (parms.viewId == "original") {
                    if (attachment.originalBase64) {
                        res.contentType = attachment.type;
                        res.send(HttpStatus.OK, new Buffer(attachment.originalBase64, 'base64'));
                    }
                    else {
                        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "There is no original view");
                    }
                }
                else if (parms.viewId == "thumbnail") {
                    if (attachment.thumbnailBase64) {
                        res.contentType = attachment.type;
                        res.send(HttpStatus.OK, new Buffer(attachment.thumbnailBase64, 'base64'));
                    }
                    else {
                        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "There is no thumbnail view");
                    }
                }
            }
            else {
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, `attachment[${parms.attachmentId}] not found`);
            }
        }
        catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }
}
