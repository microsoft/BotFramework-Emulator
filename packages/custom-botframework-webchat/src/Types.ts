import { Activity } from '@bfemulator/custom-botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}
