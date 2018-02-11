import * as React from 'react';
import * as CardBuilder from './CardBuilder';
import { HorizontalAlignment, IAdaptiveCard, TextSize, TextWeight } from 'adaptivecards';
import { Attachment, CardAction, CardImage, KnownMedia, UnknownMedia } from 'botframework-directlinejs';
import { renderIfNonempty, IDoCardAction } from './Chat';
import { FormatState } from './Store';
import { default as AdaptiveCardContainer } from './AdaptiveCardContainer';
import * as konsole from './Konsole';

const regExpCard = /\^application\/vnd\.microsoft\.card\./i;

const YOUTUBE_DOMAIN = "youtube.com";
const YOUTUBE_WWW_DOMAIN = "www.youtube.com";
const YOUTUBE_SHORT_DOMAIN = "youtu.be";
const YOUTUBE_WWW_SHORT_DOMAIN = "www.youtu.be";
const VIMEO_DOMAIN = "vimeo.com";
const VIMEO_WWW_DOMAIN = "www.vimeo.com";

export interface QueryParams {
    [propName: string]: string;
}

export const queryParams = (src: string) =>
    src
    .substr(1)
    .split('&')
    .reduce((previous, current) => {
        const keyValue = current.split('=');
        previous[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
        return previous;
    }, {} as QueryParams);

const queryString = (query: QueryParams) =>
    Object.keys(query)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(query[key].toString()))
    .join('&');

const exists = (value: any) => value != null && typeof value != "undefined";

const Youtube = (props: {
    embedId: string,
    autoPlay?: boolean,
    loop?: boolean
}) =>
    <iframe
        src={ `https://${YOUTUBE_DOMAIN}/embed/${props.embedId}?${queryString({
            modestbranding: '1',
            loop: props.loop ? '1' : '0',
            autoplay: props.autoPlay ? '1' : '0'
        })}` }
    />;

const Vimeo = (props: {
    embedId: string,
    autoPlay?: boolean,
    loop?: boolean
}) =>
    <iframe
        src={ `https://player.${VIMEO_DOMAIN}/video/${props.embedId}?${queryString({
            title: '0',
            byline: '0',
            portrait: '0',
            badge: '0',
            autoplay: props.autoPlay ? '1' : '0',
            loop: props.loop ? '1' : '0'
        })}` }
    />;

interface VideoProps {
    src: string,
    poster?: string,
    autoPlay?: boolean,
    loop?: boolean,
    onLoad?: () => void,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const Video = (props: VideoProps) => {
    const url = document.createElement('a');
    url.href = props.src;
    const urlQueryParams = queryParams(url.search);
    const pathSegments = url.pathname.substr(1).split('/');
    switch (url.hostname) {
        case YOUTUBE_DOMAIN:
        case YOUTUBE_SHORT_DOMAIN:
        case YOUTUBE_WWW_DOMAIN:
        case YOUTUBE_WWW_SHORT_DOMAIN:
            return <Youtube
                embedId={ url.hostname === YOUTUBE_DOMAIN || url.hostname === YOUTUBE_WWW_DOMAIN ? urlQueryParams['v'] : pathSegments[pathSegments.length-1] }
                autoPlay={ props.autoPlay }
                loop={ props.loop }
            />;

        case VIMEO_WWW_DOMAIN:
        case VIMEO_DOMAIN:
            return <Vimeo
                embedId={ pathSegments[pathSegments.length-1] }
                autoPlay={ props.autoPlay }
                loop={ props.loop }
            />

        default:
            return <video controls { ... props } />
    }
}

const Media = (props: {
    src: string,
    type?: 'image' | 'video' | 'audio',   // defaults to 'image'
    poster?: string,
    autoPlay?: boolean,
    loop?: boolean,
    alt?: string,
    onLoad?: () => void,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => {
    switch (props.type) {
        case 'video':
            return <Video { ...props as VideoProps }  />
        case 'audio':
            return <audio controls { ... props } />;
        default:
            return <img { ... props } />;
    }
}

const Unknown = (props: {
    format: FormatState,
    contentType: string,
    contentUrl: string,
    name: string
}) => {
    if (regExpCard.test(props.contentType)) {
        return <span>{ props.format.strings.unknownCard.replace('%1', props.contentType) }</span>;
    } else if (props.contentUrl) {
        return <div><a className="wc-link-download" href={ props.contentUrl } target="_blank" title={ props.contentUrl }><div className="wc-text-download">{ props.name || props.format.strings.unknownFile.replace('%1', props.contentType) }</div><div className="wc-icon-download"></div></a></div>;
    } else {
        return <span>{ props.format.strings.unknownFile.replace('%1', props.contentType) }</span>;
    }
}

const mediaType = (url: string) =>
    url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif' ? 'image' : 'video';

export const AttachmentView = (props: {
    format: FormatState;
    attachment: Attachment,
    onCardAction: IDoCardAction,
    onImageLoad: () => void
}) => {
    if (!props.attachment) return;
    const attachment = props.attachment as KnownMedia;
    const onCardAction = (cardAction: CardAction) => cardAction &&
        ((e: React.MouseEvent<HTMLElement>) => {
            props.onCardAction(cardAction.type, cardAction.value);
            e.stopPropagation();
        });
    const attachedImage = (
        images: CardImage[]
    ) => images && images.length > 0 &&
        <Media src={ images[0].url } onLoad={ props.onImageLoad } onClick={ onCardAction(images[0].tap) } alt={ images[0].alt } />;
    const getRichCardContentMedia = (
        type: 'image' | 'video' | 'audio' | { (url: string): 'image' | 'video' | 'audio' },
        content: {
            title?: string;
            subtitle?: string;
            text?: string;
            media?: {
                url: string;
                profile?: string;
            }[];
            buttons?: CardAction[];
            image?: {
                url: string;
                alt?: string;
            };
            autoloop?: boolean;
            autostart?: boolean;
        }
    ) => {
        if (!content.media || content.media.length === 0) {
            return null;
        }
        // rendering every media in the media array. Validates every type as image, video, audio or a function that returns those values.
        return content.media.map((md, i) => {
            let t = (typeof type === 'string')? type : type(md.url);
            return <Media
                type={ t }
                src={ md.url }
                onLoad={ props.onImageLoad }
                poster={ content.image && content.image.url }
                autoPlay={ content.autostart }
                loop={ content.autoloop }
                key={ i } />
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
            heroCardBuilder.addCommon(attachment.content)
            return (
                <AdaptiveCardContainer className="hero" nativeCard={ heroCardBuilder.card } onImageLoad={ props.onImageLoad } onCardAction={ props.onCardAction } onClick={ onCardAction(attachment.content.tap) } />
            );

        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            const thumbnailCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            if (attachment.content.images && attachment.content.images.length > 0) {
                const columns = thumbnailCardBuilder.addColumnSet([75, 25]);
                thumbnailCardBuilder.addTextBlock(attachment.content.title, { size: TextSize.Medium, weight: TextWeight.Bolder }, columns[0]);
                thumbnailCardBuilder.addTextBlock(attachment.content.subtitle, { isSubtle: true, wrap: true }, columns[0]);
                thumbnailCardBuilder.addImage(attachment.content.images[0].url, columns[1], attachment.content.images[0].tap);
                thumbnailCardBuilder.addTextBlock(attachment.content.text, { wrap: true });
                thumbnailCardBuilder.addButtons(attachment.content.buttons);
            } else {
                thumbnailCardBuilder.addCommon(attachment.content);
            }
            return (
                <AdaptiveCardContainer className="thumbnail" nativeCard={ thumbnailCardBuilder.card } onImageLoad={ props.onImageLoad } onCardAction={ props.onCardAction } onClick={ onCardAction(attachment.content.tap) } />
            );

        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <AdaptiveCardContainer className="video" nativeCard={ CardBuilder.buildCommonCard(attachment.content) } onCardAction={ props.onCardAction } >
                    {getRichCardContentMedia('video', attachment.content)}
                </AdaptiveCardContainer>
            );

        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <AdaptiveCardContainer className="animation" nativeCard={ CardBuilder.buildCommonCard(attachment.content) } onCardAction={ props.onCardAction } >
                    {getRichCardContentMedia(mediaType, attachment.content)}
                </AdaptiveCardContainer>
            );

        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (
                <AdaptiveCardContainer className="audio" nativeCard={CardBuilder.buildCommonCard(attachment.content)} onCardAction={props.onCardAction} >
                    {getRichCardContentMedia('audio', attachment.content)}
                </AdaptiveCardContainer>
            );

        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (
                <AdaptiveCardContainer className="signin" nativeCard={ CardBuilder.buildCommonCard(attachment.content) } onCardAction={ props.onCardAction } />
            );

        case "application/vnd.microsoft.card.receipt":
            if (!attachment.content)
                return null;
            const receiptCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            receiptCardBuilder.addTextBlock(attachment.content.title, { size: TextSize.Medium, weight: TextWeight.Bolder });
            const columns = receiptCardBuilder.addColumnSet([75, 25]);
            attachment.content.facts && attachment.content.facts.map((fact, i) => {
                receiptCardBuilder.addTextBlock(fact.key, { size: TextSize.Medium }, columns[0]);
                receiptCardBuilder.addTextBlock(fact.value, { size: TextSize.Medium, horizontalAlignment: HorizontalAlignment.Right }, columns[1]);
            });
            attachment.content.items && attachment.content.items.map((item, i) => {
                if (item.image) {
                    const columns2 = receiptCardBuilder.addColumnSet([15, 75, 10]);
                    receiptCardBuilder.addImage(item.image.url, columns2[0], item.image.tap);
                    receiptCardBuilder.addTextBlock(item.title, { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: true }, columns2[1]);
                    receiptCardBuilder.addTextBlock(item.subtitle, { size: TextSize.Medium, wrap: true }, columns2[1]);
                    receiptCardBuilder.addTextBlock(item.price, { horizontalAlignment: HorizontalAlignment.Right }, columns2[2]);
                } else {
                    const columns3 = receiptCardBuilder.addColumnSet([75, 25]);
                    receiptCardBuilder.addTextBlock(item.title, { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: true }, columns3[0]);
                    receiptCardBuilder.addTextBlock(item.subtitle, { size: TextSize.Medium, wrap: true }, columns3[0]);
                    receiptCardBuilder.addTextBlock(item.price, { horizontalAlignment: HorizontalAlignment.Right }, columns3[1]);
                }
            });
            if (exists(attachment.content.vat)) {
                const vatCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptVat, { size: TextSize.Medium, weight: TextWeight.Bolder }, vatCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.vat, { horizontalAlignment: HorizontalAlignment.Right }, vatCol[1]);
            }
            if (exists(attachment.content.tax)) {
                const taxCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptTax, { size: TextSize.Medium, weight: TextWeight.Bolder }, taxCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.tax, { horizontalAlignment: HorizontalAlignment.Right }, taxCol[1]);
            }
            if (exists(attachment.content.total)) {
                const totalCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptTotal, { size: TextSize.Medium, weight: TextWeight.Bolder }, totalCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.total, { horizontalAlignment: HorizontalAlignment.Right, size: TextSize.Medium, weight: TextWeight.Bolder }, totalCol[1]);
            }
            receiptCardBuilder.addButtons(attachment.content.buttons);
            return (
                <AdaptiveCardContainer className='receipt' nativeCard={ receiptCardBuilder.card } onCardAction={ props.onCardAction } onClick={ onCardAction(attachment.content.tap) } />
            );

        case "application/vnd.microsoft.card.adaptive":
            if (!attachment.content)
                return null;
            return (
                <AdaptiveCardContainer jsonCard={ attachment.content as IAdaptiveCard } onImageLoad={ props.onImageLoad } onCardAction={ props.onCardAction } />
            );

        // Deprecated format for Skype channels. For testing legacy bots in Emulator only.
        case "application/vnd.microsoft.card.flex":
            if (!attachment.content)
                return null;
            return (
                <AdaptiveCardContainer className="flex" nativeCard={ CardBuilder.buildCommonCard(attachment.content) } onCardAction={ props.onCardAction } >
                    { attachedImage(attachment.content.images) }
                </AdaptiveCardContainer>
            );

        case "image/svg+xml":
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return <Media src={ attachment.contentUrl } onLoad={ props.onImageLoad } />;

        case "audio/mpeg":
        case "audio/mp4":
            return <Media type='audio' src={ attachment.contentUrl } />;

        case "video/mp4":
            return <Media type='video' poster={ attachment.thumbnailUrl } src={ attachment.contentUrl } onLoad={ props.onImageLoad } />;

        default:
            var unknownAttachment = props.attachment as UnknownMedia;
            return <Unknown format={ props.format } contentType={ unknownAttachment.contentType } contentUrl={ unknownAttachment.contentUrl } name={ unknownAttachment.name } />;
    }
}
