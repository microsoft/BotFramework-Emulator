

export interface IAttachment {
    contentType?: string,
    contentUrl?: string,
    content?: any,
    name?: string,
    thumbnailUrl?: string,
}


export interface IAttachmentData {
    /// content type of the attachmnet
    type: string;

    /// Name of the attachment
    name: string;

    /// original content
    originalBase64: string;

    /// Thumbnail 
    thumbnailBase64: string;
}

export interface IAttachmentInfo {

    /// Name of the attachment
    name: string;

    /// ContentType of the attachment
    type: string;

    /// attachment views 
    views: IAttachmentView[];
}

export interface IAttachmentView {
    /// content type of the attachmnet
    viewId: string;

    /// Name of the attachment
    size: number;
}