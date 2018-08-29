import { IFileService } from 'msbot/bin/schema';
import { CHAT_FILES_UPDATED, EDIT_RESOURCE, ResourcesAction, TRANSCRIPTS_UPDATED } from '../action/resourcesAction';

export interface ResourcesState {
  transcripts: IFileService[];
  chats: IFileService[];
  resourceToRename: IFileService;
}

const initialState: ResourcesState = {
  transcripts: [],
  chats: [],
  resourceToRename: null
};

declare type ResourceActionType = ResourcesAction<IFileService | IFileService[]>;

export default function resources(state: ResourcesState = initialState, action: ResourceActionType): ResourcesState {
  switch (action.type) {
    case TRANSCRIPTS_UPDATED:
      return { ...state, transcripts: action.payload as IFileService[] };

    case CHAT_FILES_UPDATED:
      return { ...state, chats: action.payload as IFileService[] };

    case EDIT_RESOURCE:
      return { ...state, resourceToRename: action.payload as IFileService };

    default:
      return state;
  }
}
