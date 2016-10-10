

/// <summary>
/// An attachment within an activity
/// </summary>
export class AttachmentCrate {
    /// <summary>
    /// mimetype/Contenttype for the file
    /// </summary>
    contentType: string;

    /// <summary>
    /// Content Url
    /// </summary>
    contentUrl: string;

    /// <summary>
    /// Embedded content
    /// </summary>
    content: any;

    /// <summary>
    /// (OPTIONAL) The name of the attachment
    /// </summary>
    name: string;

    /// <summary>
    /// (OPTIONAL) Thumbnail associated with attachment
    /// </summary>
    thumbnailUrl: string;
}
