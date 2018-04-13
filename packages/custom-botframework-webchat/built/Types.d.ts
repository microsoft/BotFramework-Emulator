import { Activity } from '@bfemulator/custom-botframework-directlinejs';
export interface FormatOptions {
    showHeader?: boolean;
}
export declare type ActivityOrID = {
    activity?: Activity;
    id?: string;
};
