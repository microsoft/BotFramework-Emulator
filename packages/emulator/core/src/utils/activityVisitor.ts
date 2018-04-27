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

import AttachmentContentTypes from '../types/attachment/contentTypes';
import IActivity from '../types/activity/activity';
import IAttachment from '../types/attachment';
import ICardAction from '../types/card/cardAction';
import ICardImage from '../types/card/cardImage';
import IMediaCard from '../types/card/media';
import IMessageActivity from '../types/activity/message';
import IReceiptCard from '../types/card/receipt';
import ISigninCard from '../types/card/signIn';
import IOAuthCard from '../types/card/oAuth';
import IThumbnailCard from '../types/card/thumbnail';

export default abstract class ActivityVisitor {
  public traverseActivity(activity: IActivity) {
    const messageActivity = activity as IMessageActivity;

    if (messageActivity) {
      this.traverseMessageActivity(messageActivity);
    }
  }

  public traverseMessageActivity(messageActivity: IMessageActivity) {
    if (messageActivity && messageActivity.attachments) {
      messageActivity.attachments.forEach(attachment => {
        this.traverseAttachment(attachment)
      });
    }
  }

  public traverseAttachment(attachment: IAttachment) {
    if (attachment) {
      switch(attachment.contentType) {
        case AttachmentContentTypes.animationCard:
        case AttachmentContentTypes.videoCard:
        case AttachmentContentTypes.audioCard:
          this.traverseMediaCard(attachment.content as IMediaCard);
          break;

        case AttachmentContentTypes.heroCard:
        case AttachmentContentTypes.thumbnailCard:
          this.traverseThumbnailCard(attachment.content as IThumbnailCard);
          break;

        case AttachmentContentTypes.receiptCard:
          this.traverseReceiptCard(attachment.content as IReceiptCard);
          break;

        case AttachmentContentTypes.signInCard:
          this.traverseSignInCard(attachment.content as ISigninCard);
          break;

        case AttachmentContentTypes.oAuthCard:
          this.traverseOAuthCard(attachment.content as IOAuthCard);
          break;
      }
    }
  }

  public traverseMediaCard(mediaCard: IMediaCard) {
    if (mediaCard) {
      this.traverseCardImage(mediaCard.image);
      this.traverseButtons(mediaCard.buttons);
    }
  }

  public traverseThumbnailCard(thumbnailCard: IThumbnailCard) {
    this.visitCardAction(thumbnailCard.tap);
    this.traverseButtons(thumbnailCard.buttons);
    this.traverseCardImages(thumbnailCard.images);
  }

  public traverseSignInCard(signInCard: ISigninCard) {
    this.traverseButtons(signInCard.buttons);
  }

  public traverseOAuthCard(oauthCard: IOAuthCard) {
      let buttons = oauthCard.buttons;
      if (buttons) {
          buttons.forEach(cardAction => this.visitOAuthCardAction(oauthCard.connectionName, cardAction));
      }
  }

  public traverseReceiptCard(receiptCard: IReceiptCard) {
    this.visitCardAction(receiptCard.tap);
    this.traverseButtons(receiptCard.buttons);
  }

  public traverseButtons(buttons: ICardAction[]) {
    if (buttons) {
      buttons.forEach(cardAction => this.visitCardAction(cardAction));
    }
  }

  public traverseCardImages(cardImages: ICardImage[]) {
    if (cardImages) {
      cardImages.forEach(image => {
        this.traverseCardImage(image);
      });
    }
  }

  public traverseCardImage(cardImage: ICardImage) {
    if (cardImage) {
      this.visitCardAction(cardImage.tap);
    }
  }

  protected abstract visitCardAction(cardAction: ICardAction);

  protected visitOAuthCardAction(connectionName: string, cardAction: ICardAction) {
      this.visitCardAction(cardAction);
  }
}
