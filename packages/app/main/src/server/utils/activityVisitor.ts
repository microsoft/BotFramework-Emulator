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

import {
  Activity,
  Attachment,
  CardAction,
  CardImage,
  MediaCard,
  OAuthCard,
  ReceiptCard,
  SigninCard,
  ThumbnailCard,
} from 'botframework-schema';
import { AttachmentContentTypes } from '@bfemulator/sdk-shared';

export abstract class ActivityVisitor {
  public traverseActivity(messageActivity: Activity) {
    if (!messageActivity) {
      return;
    }
    if (messageActivity && messageActivity.attachments) {
      messageActivity.attachments.forEach(attachment => {
        this.traverseAttachment(attachment);
      });
    }
  }

  public traverseAttachment(attachment: Attachment) {
    if (attachment) {
      switch (attachment.contentType) {
        case AttachmentContentTypes.animationCard:
        case AttachmentContentTypes.videoCard:
        case AttachmentContentTypes.audioCard:
          this.traverseMediaCard(attachment.content as MediaCard);
          break;

        case AttachmentContentTypes.heroCard:
        case AttachmentContentTypes.thumbnailCard:
          this.traverseThumbnailCard(attachment.content as ThumbnailCard);
          break;

        case AttachmentContentTypes.receiptCard:
          this.traverseReceiptCard(attachment.content as ReceiptCard);
          break;

        case AttachmentContentTypes.signInCard:
          this.traverseSignInCard(attachment.content as SigninCard);
          break;

        case AttachmentContentTypes.oAuthCard:
          this.traverseOAuthCard(attachment.content as OAuthCard);
          break;

        default:
          break;
      }
    }
  }

  public traverseMediaCard(mediaCard: MediaCard) {
    if (mediaCard) {
      this.traverseCardImage(mediaCard.image);
      this.traverseButtons(mediaCard.buttons);
    }
  }

  public traverseThumbnailCard(thumbnailCard: ThumbnailCard) {
    this.visitCardAction(thumbnailCard.tap);
    this.traverseButtons(thumbnailCard.buttons);
    this.traverseCardImages(thumbnailCard.images);
  }

  public traverseSignInCard(signInCard: SigninCard) {
    this.traverseButtons(signInCard.buttons);
  }

  public traverseOAuthCard(oauthCard: OAuthCard) {
    const buttons = oauthCard.buttons;
    if (buttons) {
      buttons.forEach(cardAction => this.visitOAuthCardAction(oauthCard.connectionName, cardAction));
    }
  }

  public traverseReceiptCard(receiptCard: ReceiptCard) {
    this.visitCardAction(receiptCard.tap);
    this.traverseButtons(receiptCard.buttons);
  }

  public traverseButtons(buttons: CardAction[]) {
    if (buttons) {
      buttons.forEach(cardAction => this.visitCardAction(cardAction));
    }
  }

  public traverseCardImages(cardImages: CardImage[]) {
    if (cardImages) {
      cardImages.forEach(image => {
        this.traverseCardImage(image);
      });
    }
  }

  public traverseCardImage(cardImage: CardImage) {
    if (cardImage) {
      this.visitCardAction(cardImage.tap);
    }
  }

  protected abstract visitCardAction(cardAction: CardAction);

  protected visitOAuthCardAction(connectionName: string, cardAction: CardAction) {
    this.visitCardAction(cardAction);
  }
}
