import * as Restify from 'restify';


export class AttachmentsController {

    public registerRoutes(server: Restify.Server) {
        server.get('/v3/attachments/:attachment_id', this.getAttachmentInfo);
        server.get('/v3/attachments/:attachment_id/views/:view_id', this.getAttachment);
    }

    getAttachmentInfo = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getAttachmentInfo");
        res.send(200, {});
        return next();
    }

    getAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getAttachment");
        res.send(200, {});
        return next();
    }
}

