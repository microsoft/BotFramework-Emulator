/// <summary>
/// An attachment to a crate
/// </summary>
export interface IAttachmentCrate {
    /// <summary>
    /// URL for this attachment
    /// </summary>
    url: string;

    /// <summary>
    /// Content type for this attachment
    /// </summary>
    contentType: string;

    /// <summary>
    /// (OPTIONAL) Name of this attachment
    /// </summary>
    name?: string;

    /// <summary>
    /// (OPTIONAL) Thumbnail associated with this attachment
    /// </summary>
    thumbnailUrl?: string;

    /// <summary>
    /// (OPTIONAL) Original URL where this attachment was copied from
    /// </summary>
    originalUrl?: string;
}
