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
  AttachmentContentTypes,
  CardAction,
  MediaCard,
  MessageActivity,
  OAuthCard,
  ReceiptCard,
  SigninCard,
  ThumbnailCard,
} from '@bfemulator/sdk-shared';

import { ActivityVisitor } from './activityVisitor';

class MockActivityVisitor extends ActivityVisitor {
  public cardActionVisitors: CardAction[] = [];

  visitCardAction(cardAction: CardAction) {
    this.cardActionVisitors.push(cardAction);
  }
}

describe('The activityVisitor', () => {
  let activityVisitor: MockActivityVisitor;
  beforeEach(() => {
    activityVisitor = new MockActivityVisitor();
  });

  it('should traverse each attachment based on type', () => {
    const mockMediaCard: Partial<MediaCard> = {
      image: {
        url: '',
        alt: '',
        tap: { image: '', title: '', type: 'png', value: '' },
      },
      buttons: [{ image: '', title: '', type: 'png', value: '' }],
    };

    const mockThumbnailCard: Partial<ThumbnailCard> = {
      buttons: [{ image: '', title: '', type: 'png', value: '' }],
      tap: { image: '', title: '', type: 'png', value: '' },
      images: [
        {
          url: '',
          alt: '',
          tap: { image: '', title: '', type: 'png', value: '' },
        },
      ],
    };

    const mockReceiptCard: Partial<ReceiptCard> = {
      buttons: [{ image: '', title: '', type: 'png', value: '' }],
      tap: { image: '', title: '', type: 'png', value: '' },
    };

    const mockOauthCard: Partial<OAuthCard> = {
      buttons: [{ image: '', title: '', type: 'png', value: '' }],
      connectionName: 'oauth',
    };

    const mockSigninCard: Partial<SigninCard> = {
      buttons: [{ image: '', title: '', type: 'png', value: '' }],
      text: '',
    };

    const mockMessageActivity: MessageActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.animationCard,
          content: mockMediaCard,
        },
        {
          contentType: AttachmentContentTypes.audioCard,
          content: mockMediaCard,
        },
        {
          contentType: AttachmentContentTypes.heroCard,
          content: mockThumbnailCard,
        },
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: mockOauthCard,
        },
        {
          contentType: AttachmentContentTypes.receiptCard,
          content: mockReceiptCard,
        },
        {
          contentType: AttachmentContentTypes.signInCard,
          content: mockSigninCard,
        },
        {
          contentType: AttachmentContentTypes.thumbnailCard,
          content: mockThumbnailCard,
        },
        {
          contentType: AttachmentContentTypes.videoCard,
          content: mockMediaCard,
        },
      ],
    };
    activityVisitor.traverseActivity(mockMessageActivity);
    const { cardActionVisitors } = activityVisitor;
    // Animation card
    expect(cardActionVisitors[0]).toBe(mockMediaCard.image.tap);
    expect(cardActionVisitors[1]).toBe(mockMediaCard.buttons[0]);
    // Audio card
    expect(cardActionVisitors[2]).toBe(mockMediaCard.image.tap);
    expect(cardActionVisitors[3]).toBe(mockMediaCard.buttons[0]);
    // Hero card
    expect(cardActionVisitors[4]).toBe(mockThumbnailCard.tap);
    expect(cardActionVisitors[5]).toBe(mockThumbnailCard.buttons[0]);
    expect(cardActionVisitors[6]).toBe(mockThumbnailCard.images[0].tap);
    // oAuth card
    expect(cardActionVisitors[7]).toBe(mockOauthCard.buttons[0]);
    // receipt card
    expect(cardActionVisitors[8]).toBe(mockReceiptCard.tap);
    expect(cardActionVisitors[9]).toBe(mockReceiptCard.buttons[0]);
    // sign in card
    expect(cardActionVisitors[10]).toBe(mockSigninCard.buttons[0]);
    // thumbnail card
    expect(cardActionVisitors[11]).toBe(mockThumbnailCard.tap);
    expect(cardActionVisitors[12]).toBe(mockThumbnailCard.buttons[0]);
    expect(cardActionVisitors[13]).toBe(mockThumbnailCard.images[0].tap);
    // Video card
    expect(cardActionVisitors[14]).toBe(mockMediaCard.image.tap);
    expect(cardActionVisitors[15]).toBe(mockMediaCard.buttons[0]);
  });
});
