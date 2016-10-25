import * as Restify from 'restify';


export class AttachmentsController {

    static registerRoutes(server: Restify.Server) {
        server.get('/v3/attachments/:attachment_id', AttachmentsController.getAttachmentInfo);
        server.get('/v3/attachments/:attachment_id/views/:view_id', AttachmentsController.getAttachment);
    }

    static getAttachmentInfo(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getAttachmentInfo");
        res.send(501);
        res.end();
    }

    static getAttachment(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getAttachment");
        res.send(501);
        res.end();
    }
}
