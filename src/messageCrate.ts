

export class MessageCrate {
    public V3Type = "v3";

    public TABLE = "Messages";
    // User IDs must be <= 100 characters
    public MaxUserIdLength = 64;

    public static SanitizeWatermark = (watermark: string) => {
        if (null === watermark) return null;
        return watermark.replace(/[^\d]/g, '');
    }

    public id: string;
    public conversationId: string;
    public created: Date;
    public from: string;
    public text: string;
    public channelData: string;
    public imagesJson: string;
    public attachmentsJson: string;

    //public string JsonType { get; set; }
    //public string Json0 { get; set; }

    /*
    public void AddAttachment(string originalUrl, string url, string contentType, string name)
    {
        List<CrateAttachment> attachments = JsonConvert.DeserializeObject<CrateAttachment[]>(AttachmentsJson ?? "[]").ToList();
        attachments = attachments.Where(a => a.Url != url).ToList();
        attachments.Add(new CrateAttachment() { Url = url, ContentType = contentType, Name = name, OriginalUrl = originalUrl });
        AttachmentsJson = JsonConvert.SerializeObject(attachments);
    }

    public bool V1ImageStorageModel
    {
        get { return !string.IsNullOrEmpty(ImagesJson); }
    }

    public string[] GetCratedImages()
    {
        if (!string.IsNullOrEmpty(ImagesJson))
            return JsonConvert.DeserializeObject<string[]>(ImagesJson);

        return GetCratedAttachments()
            .Where(a => RestApiStore.IsImageContentType(a.ContentType))
            .Select(a => a.Url)
            .ToArray();
    }

    public CrateAttachment[] GetCratedNonImageAttachments()
    {
        return GetCratedAttachments()
            .Where(a => !RestApiStore.IsImageContentType(a.ContentType))
            .ToArray();
    }

    public CrateAttachment[] GetCratedAttachments()
    {
        return JsonConvert.DeserializeObject<CrateAttachment[]>(AttachmentsJson ?? "[]");
    }

    public string GetJson()
    {
        if (JsonType != V3Type || Json0 == null)
            return null;

        return Json0;
    }

    public IActivity GetJsonAsActivity()
    {
        string json = GetJson();
        if (json == null)
            return null;

        return JsonConvert.DeserializeObject<Activity>(json);
    }

    public void SetActivityJson(IActivity activity)
    {
        JsonType = V3Type;
        Json0 = JsonConvert.SerializeObject(activity);
    }

    public ulong GetWatermark()
    {
        if (string.IsNullOrEmpty(RowKey))
            return 0;

        ulong result;
        ulong.TryParse(RowKey, out result);
        return result;
    }

    public static MessageCrate CreateMessageCrateForAttachment(string botId, string conversationId, CrateAttachment attachment)
    {
        DateTime now = DateTime.UtcNow;
        EntityKey key = new EntityKey(IdFactory.CreateId(), now.ToFileTimeUtc().ToString());

        MessageCrate crate = new MessageCrate
        {
            PartitionKey = key.PartitionKey,
            RowKey = key.RowKey,

            Id = key.ToString(),
            ConversationId = conversationId,
            Created = now,
            From = botId,
        };

        crate.AddAttachment(null, attachment.Url, attachment.ContentType, attachment.Name);

        return crate;
    }
    */
}