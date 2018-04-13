/// <reference types="react" />
import { Attachment } from '@bfemulator/custom-botframework-directlinejs';
import { IDoCardAction } from './Chat';
import { FormatState } from './Store';
export interface QueryParams {
    [propName: string]: string;
}
export declare const queryParams: (src: string) => QueryParams;
export declare const AttachmentView: (props: {
    format: FormatState;
    attachment: Attachment;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
}) => JSX.Element;
