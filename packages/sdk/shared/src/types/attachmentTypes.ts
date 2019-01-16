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

export interface Attachment {
  contentType?: string;
  contentUrl?: string;
  content?: any;
  name?: string;
  thumbnailUrl?: string;
}

export interface AttachmentData {
  /// content type of the attachmnet
  type: string;

  /// Name of the attachment
  name: string;

  /// original content
  originalBase64: string;

  /// Thumbnail
  thumbnailBase64: string;
}

export interface AttachmentInfo {
  /// Name of the attachment
  name: string;

  /// ContentType of the attachment
  type: string;

  /// attachment views
  views: AttachmentView[];
}

export interface AttachmentView {
  /// content type of the attachmnet
  viewId: string;

  /// Name of the attachment
  size: number;
}

export interface CardAction {
  /// URL to a picture that will appear on the button, next to text label.
  image: string;

  /// Text description that appears on the button.
  title: string;

  /// Defines the type of action implemented by this button.
  type: string;

  /// Supplementary parameter for action. Content of this property depends on the ActionType
  value?: any;
}

export class AttachmentContentTypes {
  public static animationCard = 'application/vnd.microsoft.card.animation';
  public static audioCard = 'application/vnd.microsoft.card.audio';
  public static heroCard = 'application/vnd.microsoft.card.hero';
  public static receiptCard = 'application/vnd.microsoft.card.receipt';
  public static signInCard = 'application/vnd.microsoft.card.signin';
  public static thumbnailCard = 'application/vnd.microsoft.card.thumbnail';
  public static videoCard = 'application/vnd.microsoft.card.video';
}

export interface CardImage {
  url: string; // Thumbnail image for major content property.
  alt: string; // Image description intended for screen readers
  tap: CardAction; // Action assigned to specific Attachment.
  // E.g. navigate to specific URL or play/open media content
}

export interface CardMediaUrl {
  url: string; // Url to audio, video or animation media
  profile: string; // Optional profile hint to the client to differentiate
  // multiple MediaUrl objects from each other
}

export interface SigninCard {
  text: string; // Title of the Card
  buttons: CardAction[]; // Sign in action
}

export interface OAuthCard {
  text: string; // Title of the Card
  connectionName: string; // OAuth connection name
  buttons: CardAction[]; // Sign in action
}

export interface Keyboard {
  buttons: CardAction[]; // Set of actions applicable to the current card.
}

export interface ThumbnailCard extends Keyboard {
  title: string; // Title of the Card
  subtitle: string; // Subtitle appears just below Title field, differs from Title in font styling only
  text: string; // Text field appears just below subtitle, differs from Subtitle in font styling only
  images: CardImage[]; // Messaging supports all media formats: audio, video,
  // images and thumbnails as well to optimize content download.
  tap: CardAction; // This action will be activated when user taps on the section bubble.
}

export interface MediaCard extends Keyboard {
  title: string; // Title of the Card
  subtitle: string; // Subtitle appears just below Title field, differs from Title in font styling only
  text: string; // Text field appears just below subtitle, differs from Subtitle in font styling only
  image: CardImage; // Messaging supports all media formats: audio, video, images and
  // thumbnails as well to optimize content download.
  media: CardMediaUrl[]; // Media source for video, audio or animations
  autoloop: boolean; // Should the media source reproduction run in a lool
  autostart: boolean; // Should the media start automatically
  shareable: boolean; // Should media be shareable
  buttons: CardAction[]; // Set of actions applicable to the current card.
}

export interface VideoCard extends MediaCard {
  aspect: string; // Hint of the aspect ratio of the video or animation. (16:9)(4:3)
}

export interface AnimationCard extends MediaCard {}

export interface AudioCard extends MediaCard {}

export interface Fact {
  key: string; // Name of parameter
  value: string; // Value of parameter
}

export interface ReceiptCard {
  title: string; // Title of the Card
  items: ReceiptItem[]; // Array of receipt items.
  facts: Fact[]; // Array of key-value pairs.
  tap: CardAction; // This action will be activated when user taps on the section bubble.
  total: string; // Total amount of money paid (or should be paid)
  tax: string; // Total amount of TAX paid (or should be paid)
  vat: string; // Total amount of VAT paid (or should be paid)
  buttons: CardAction[]; // Set of actions applicable to the current card.
}

export interface ReceiptItem {
  title: string; // Title of the Card
  subtitle: string; // Subtitle appears just below Title field, differs from Title in font styling only
  text: string; // Text field appears just below subtitle, differs from Subtitle in font styling only
  image: CardImage;
  price: string; // Amount with currency
  quantity: string; // Number of items of given kind
  tap: CardAction; // This action will be activated when user taps on the Item bubble.
}
