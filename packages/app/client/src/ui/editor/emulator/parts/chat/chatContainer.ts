import { Chat } from './chat';
import { connect } from 'react-redux';
import { RootState } from '../../../../../data/store';
import { IEndpointService } from 'botframework-config/lib/schema';

const mapStateToProps = (state: RootState, { document }) => ({
  currentUserId: state.clientAwareSettings.users.currentUserId,
  endpoint: ((state.bot.activeBot && state.bot.activeBot.services) || [])
    .find(s => s.id === document.endpointId) as IEndpointService
});

export const ChatContainer = connect(mapStateToProps, null)(Chat);
