//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { IActivity, IMessageActivity } from '../types/activityTypes';
import * as Attachments from '../types/attachmentTypes';

export abstract class ActivityVisitor {

    public traverseActivity(activity: IActivity) {
        let messageActivity = activity as IMessageActivity;
        if (messageActivity) {
            this.traverseMessageActivity(messageActivity);
        }
    }

    public traverseMessageActivity(messageActivity: IMessageActivity) {
        if (messageActivity) {
            if (messageActivity.attachments) {
                messageActivity.attachments.forEach(attachment =>
                    this.traverseAttachment(attachment));
            } 
        }
    }

    public traverseAttachment(attachment: Attachments.IAttachment) {
        if (attachment) {
            switch(attachment.contentType) {
                case Attachments.AttachmentContentTypes.animationCard:
                case Attachments.AttachmentContentTypes.videoCard:
                case Attachments.AttachmentContentTypes.audioCard:
                    this.traverseMediaCard(attachment.content as Attachments.IMediaCard);
                    break;
                case Attachments.AttachmentContentTypes.heroCard:
                case Attachments.AttachmentContentTypes.thumbnailCard:
                    this.traverseThumbnailCard(attachment.content as Attachments.IThumbnailCard);
                    break;
                case Attachments.AttachmentContentTypes.receiptCard:
                    this.traverseReceiptCard(attachment.content as Attachments.IReceiptCard);
                    break;
                case Attachments.AttachmentContentTypes.signInCard:
                    this.traverseSignInCard(attachment.content as Attachments.ISigninCard);
                    break;
            }
        }
    }

    public traverseMediaCard(mediaCard: Attachments.IMediaCard) {
        if (mediaCard) {
            this.traverseCardImage(mediaCard.image);
            this.traverseButtons(mediaCard.buttons);
        }        
    }

    public traverseThumbnailCard(thumbnailCard: Attachments.IThumbnailCard) {
        this.visitCardAction(thumbnailCard.tap);
        this.traverseButtons(thumbnailCard.buttons);
        this.traverseCardImages(thumbnailCard.images);
    }

    public traverseSignInCard(signInCard: Attachments.ISigninCard) {
        this.traverseButtons(signInCard.buttons);
    }

    public traverseReceiptCard(receiptCard: Attachments.IReceiptCard) {
        this.visitCardAction(receiptCard.tap);
        this.traverseButtons(receiptCard.buttons);
    }

    public traverseButtons(buttons: Attachments.ICardAction[]) {
        if (buttons) {
            buttons.forEach(cardAction => this.visitCardAction(cardAction));
        }
    }

    public traverseCardImages(cardImages: Attachments.ICardImage[]) {
        if (cardImages) {
            cardImages.forEach(image => {
                this.traverseCardImage(image);
            })
        }
    }

    public traverseCardImage(cardImage: Attachments.ICardImage) {
        if (cardImage) {
            this.visitCardAction(cardImage.tap);
        }
    }

    protected abstract visitCardAction(cardAction: Attachments.ICardAction);
}