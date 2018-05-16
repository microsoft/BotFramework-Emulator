"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const CardBuilder = require("./CardBuilder");
const adaptivecards_1 = require("adaptivecards");
const AdaptiveCardContainer_1 = require("./AdaptiveCardContainer");
const regExpCard = /\^application\/vnd\.microsoft\.card\./i;
const YOUTUBE_DOMAIN = "youtube.com";
const YOUTUBE_WWW_DOMAIN = "www.youtube.com";
const YOUTUBE_SHORT_DOMAIN = "youtu.be";
const YOUTUBE_WWW_SHORT_DOMAIN = "www.youtu.be";
const VIMEO_DOMAIN = "vimeo.com";
const VIMEO_WWW_DOMAIN = "www.vimeo.com";
exports.queryParams = (src) => src
    .substr(1)
    .split('&')
    .reduce((previous, current) => {
    const keyValue = current.split('=');
    previous[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
    return previous;
}, {});
const queryString = (query) => Object.keys(query)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(query[key].toString()))
    .join('&');
const exists = (value) => value != null && typeof value != "undefined";
const Youtube = (props) => React.createElement("iframe", { src: `https://${YOUTUBE_DOMAIN}/embed/${props.embedId}?${queryString({
        modestbranding: '1',
        loop: props.loop ? '1' : '0',
        autoplay: props.autoPlay ? '1' : '0'
    })}` });
const Vimeo = (props) => React.createElement("iframe", { src: `https://player.${VIMEO_DOMAIN}/video/${props.embedId}?${queryString({
        title: '0',
        byline: '0',
        portrait: '0',
        badge: '0',
        autoplay: props.autoPlay ? '1' : '0',
        loop: props.loop ? '1' : '0'
    })}` });
const Video = (props) => {
    const url = document.createElement('a');
    url.href = props.src;
    const urlQueryParams = exports.queryParams(url.search);
    const pathSegments = url.pathname.substr(1).split('/');
    switch (url.hostname) {
        case YOUTUBE_DOMAIN:
        case YOUTUBE_SHORT_DOMAIN:
        case YOUTUBE_WWW_DOMAIN:
        case YOUTUBE_WWW_SHORT_DOMAIN:
            return React.createElement(Youtube, { embedId: url.hostname === YOUTUBE_DOMAIN || url.hostname === YOUTUBE_WWW_DOMAIN ? urlQueryParams['v'] : pathSegments[pathSegments.length - 1], autoPlay: props.autoPlay, loop: props.loop });
        case VIMEO_WWW_DOMAIN:
        case VIMEO_DOMAIN:
            return React.createElement(Vimeo, { embedId: pathSegments[pathSegments.length - 1], autoPlay: props.autoPlay, loop: props.loop });
        default:
            return React.createElement("video", Object.assign({ controls: true }, props));
    }
};
const Media = (props) => {
    switch (props.type) {
        case 'video':
            return React.createElement(Video, Object.assign({}, props));
        case 'audio':
            return React.createElement("audio", Object.assign({ controls: true }, props));
        default:
            return React.createElement("img", Object.assign({}, props));
    }
};
const Unknown = (props) => {
    if (regExpCard.test(props.contentType)) {
        return React.createElement("span", null, props.format.strings.unknownCard.replace('%1', props.contentType));
    }
    else if (props.contentUrl) {
        return React.createElement("div", null,
            React.createElement("a", { className: "wc-link-download", href: props.contentUrl, target: "_blank", title: props.contentUrl },
                React.createElement("div", { className: "wc-text-download" }, props.name || props.format.strings.unknownFile.replace('%1', props.contentType)),
                React.createElement("div", { className: "wc-icon-download" })));
    }
    else {
        return React.createElement("span", null, props.format.strings.unknownFile.replace('%1', props.contentType));
    }
};
const mediaType = (url) => url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif' ? 'image' : 'video';
exports.AttachmentView = (props) => {
    if (!props.attachment)
        return;
    const attachment = props.attachment;
    const onCardAction = (cardAction) => cardAction &&
        ((e) => {
            props.onCardAction(cardAction.type, cardAction.value);
            e.stopPropagation();
        });
    const attachedImage = (images) => images && images.length > 0 &&
        React.createElement(Media, { src: images[0].url, onLoad: props.onImageLoad, onClick: onCardAction(images[0].tap), alt: images[0].alt });
    const getRichCardContentMedia = (type, content) => {
        if (!content.media || content.media.length === 0) {
            return null;
        }
        // rendering every media in the media array. Validates every type as image, video, audio or a function that returns those values.
        return content.media.map((md, i) => {
            let t = (typeof type === 'string') ? type : type(md.url);
            return React.createElement(Media, { type: t, src: md.url, onLoad: props.onImageLoad, poster: content.image && content.image.url, autoPlay: content.autostart, loop: content.autoloop, key: i });
        });
    };
    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            if (!attachment.content)
                return null;
            const heroCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            if (attachment.content.images) {
                attachment.content.images.forEach(img => heroCardBuilder.addImage(img.url, null, img.tap));
            }
            heroCardBuilder.addCommon(attachment.content);
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "hero", nativeCard: heroCardBuilder.card, onImageLoad: props.onImageLoad, onCardAction: props.onCardAction, onClick: onCardAction(attachment.content.tap) }));
        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            const thumbnailCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            if (attachment.content.images && attachment.content.images.length > 0) {
                const columns = thumbnailCardBuilder.addColumnSet([75, 25]);
                thumbnailCardBuilder.addTextBlock(attachment.content.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, columns[0]);
                thumbnailCardBuilder.addTextBlock(attachment.content.subtitle, { isSubtle: true, wrap: true }, columns[0]);
                thumbnailCardBuilder.addImage(attachment.content.images[0].url, columns[1], attachment.content.images[0].tap);
                thumbnailCardBuilder.addTextBlock(attachment.content.text, { wrap: true });
                thumbnailCardBuilder.addButtons(attachment.content.buttons);
            }
            else {
                thumbnailCardBuilder.addCommon(attachment.content);
            }
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "thumbnail", nativeCard: thumbnailCardBuilder.card, onImageLoad: props.onImageLoad, onCardAction: props.onCardAction, onClick: onCardAction(attachment.content.tap) }));
        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "video", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, getRichCardContentMedia('video', attachment.content)));
        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "animation", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, getRichCardContentMedia(mediaType, attachment.content)));
        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "audio", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, getRichCardContentMedia('audio', attachment.content)));
        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "signin", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }));
        case "application/vnd.microsoft.card.oauth":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "signin", nativeCard: CardBuilder.buildOAuthCard(attachment.content), onCardAction: props.onCardAction }));
        case "application/vnd.microsoft.card.receipt":
            if (!attachment.content)
                return null;
            const receiptCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            receiptCardBuilder.addTextBlock(attachment.content.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder });
            const columns = receiptCardBuilder.addColumnSet([75, 25]);
            attachment.content.facts && attachment.content.facts.map((fact, i) => {
                receiptCardBuilder.addTextBlock(fact.key, { size: adaptivecards_1.TextSize.Medium }, columns[0]);
                receiptCardBuilder.addTextBlock(fact.value, { size: adaptivecards_1.TextSize.Medium, horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, columns[1]);
            });
            attachment.content.items && attachment.content.items.map((item, i) => {
                if (item.image) {
                    const columns2 = receiptCardBuilder.addColumnSet([15, 75, 10]);
                    receiptCardBuilder.addImage(item.image.url, columns2[0], item.image.tap);
                    receiptCardBuilder.addTextBlock(item.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder, wrap: true }, columns2[1]);
                    receiptCardBuilder.addTextBlock(item.subtitle, { size: adaptivecards_1.TextSize.Medium, wrap: true }, columns2[1]);
                    receiptCardBuilder.addTextBlock(item.price, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, columns2[2]);
                }
                else {
                    const columns3 = receiptCardBuilder.addColumnSet([75, 25]);
                    receiptCardBuilder.addTextBlock(item.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder, wrap: true }, columns3[0]);
                    receiptCardBuilder.addTextBlock(item.subtitle, { size: adaptivecards_1.TextSize.Medium, wrap: true }, columns3[0]);
                    receiptCardBuilder.addTextBlock(item.price, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, columns3[1]);
                }
            });
            if (exists(attachment.content.vat)) {
                const vatCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptVat, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, vatCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.vat, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, vatCol[1]);
            }
            if (exists(attachment.content.tax)) {
                const taxCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptTax, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, taxCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.tax, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, taxCol[1]);
            }
            if (exists(attachment.content.total)) {
                const totalCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptTotal, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, totalCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.total, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right, size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, totalCol[1]);
            }
            receiptCardBuilder.addButtons(attachment.content.buttons);
            return (React.createElement(AdaptiveCardContainer_1.default, { className: 'receipt', nativeCard: receiptCardBuilder.card, onCardAction: props.onCardAction, onClick: onCardAction(attachment.content.tap) }));
        case "application/vnd.microsoft.card.adaptive":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { jsonCard: attachment.content, onImageLoad: props.onImageLoad, onCardAction: props.onCardAction }));
        // Deprecated format for Skype channels. For testing legacy bots in Emulator only.
        case "application/vnd.microsoft.card.flex":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "flex", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, attachedImage(attachment.content.images)));
        case "image/svg+xml":
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return React.createElement(Media, { src: attachment.contentUrl, onLoad: props.onImageLoad });
        case "audio/mpeg":
        case "audio/mp4":
            return React.createElement(Media, { type: 'audio', src: attachment.contentUrl });
        case "video/mp4":
            return React.createElement(Media, { type: 'video', poster: attachment.thumbnailUrl, src: attachment.contentUrl, onLoad: props.onImageLoad });
        default:
            var unknownAttachment = props.attachment;
            return React.createElement(Unknown, { format: props.format, contentType: unknownAttachment.contentType, contentUrl: unknownAttachment.contentUrl, name: unknownAttachment.name });
    }
};
//# sourceMappingURL=Attachment.js.map