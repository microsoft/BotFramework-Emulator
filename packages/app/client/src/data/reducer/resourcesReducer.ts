import { IFileService } from "botframework-config/lib/schema";

import {
  CHAT_FILES_UPDATED,
  CHATS_DIRECTORY_UPDATED,
  EDIT_RESOURCE,
  ResourcesAction,
  TRANSCRIPTS_DIRECTORY_UPDATED,
  TRANSCRIPTS_UPDATED
} from "../action/resourcesAction";

export interface ResourcesState {
  transcripts: IFileService[];
  transcriptsPath: string;
  chats: IFileService[];
  chatsPath: string;
  resourceToRename: IFileService;
}

const initialState: ResourcesState = {
  transcripts: [],
  transcriptsPath: "",
  chats: [],
  chatsPath: "",
  resourceToRename: null
};

declare type ResourceActionType = ResourcesAction<
  IFileService | IFileService[] | string
>;

export function resources(
  state: ResourcesState = initialState,
  action: ResourceActionType
): ResourcesState {
  switch (action.type) {
    case TRANSCRIPTS_UPDATED:
      return { ...state, transcripts: action.payload as IFileService[] };

    case TRANSCRIPTS_DIRECTORY_UPDATED:
      return { ...state, transcriptsPath: action.payload as string };

    case CHAT_FILES_UPDATED:
      return { ...state, chats: action.payload as IFileService[] };

    case CHATS_DIRECTORY_UPDATED:
      return { ...state, chatsPath: action.payload as string };

    case EDIT_RESOURCE:
      return { ...state, resourceToRename: action.payload as IFileService };

    default:
      return state;
  }
}
