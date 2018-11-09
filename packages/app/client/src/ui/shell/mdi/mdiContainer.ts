import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { connect } from 'react-redux';
import { closeDocument } from '../../../data/action/chatActions';
import { close, setActiveTab } from '../../../data/action/editorActions';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { Document } from '../../../data/reducer/editor';
import { RootState } from '../../../data/store';
import { MDIComponent } from './mdi';

export interface MDIProps {
  activeBot?: BotConfigWithPath;
  activeDocumentId?: string;
  activeEditor?: string;
  chats?: { [chatId: string]: any };
  documents?: { [documentId: string]: Document };
  tabOrder?: string[];
  owningEditor?: string;
  setActiveTab?: (tab: string) => void;
  closeTab?: (documentId: string) => void;
}

const mapStateToProps = (state: RootState, ownProps: MDIProps): MDIProps => ({
  activeBot: state.bot.activeBot,
  activeDocumentId: state.editor.editors[ownProps.owningEditor].activeDocumentId,
  activeEditor: state.editor.activeEditor,
  chats: state.chat.chats,
  documents: state.editor.editors[ownProps.owningEditor].documents,
  tabOrder: state.editor.editors[ownProps.owningEditor].tabOrder,
});

const mapDispatchToProps = (dispatch): MDIProps => ({
  setActiveTab: (tab: string) => dispatch(setActiveTab(tab)),
  closeTab: (documentId: string) => {
    dispatch(close(getTabGroupForDocument(documentId), documentId));
    dispatch(closeDocument(documentId));
  }
});

export const MDI = connect(mapStateToProps, mapDispatchToProps)(MDIComponent);
