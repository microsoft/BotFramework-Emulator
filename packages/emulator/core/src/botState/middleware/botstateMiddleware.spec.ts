import BotState from '../../facility/botState';
import ConversationSet from '../../facility/conversationSet';
import BotEndpoint from '../../facility/botEndpoint';
import deleteStateForUser from './deleteStateForUser';
import * as HttpStatus from 'http-status-codes';
import Conversation from '../../facility/conversation';
import BotEmulator from '../../botEmulator';
import User from '../../types/user';

describe('The botStateMiddleware', () => {

  let botState: BotState;
  let emulator: BotEmulator;
  let conversation: Conversation;
  let user: User;

  beforeEach(() => {
    emulator = { facilities: { logger: { logMessage: () => true } } } as any;
    emulator.facilities.conversations = new ConversationSet();
    user = { id: '321', name: 'a user' };
    const endpoint = new BotEndpoint('12', '123', 'http://localhost:12345', '', '', false, {});
    conversation = emulator.facilities.conversations.newConversation(emulator, endpoint, user);
    botState = new BotState(emulator, 256);
    botState.setBotData('3c', conversation.conversationId, user.id, { eTag: 'tag', data: {} });
    emulator.facilities.botState = botState;
  });

  it('should delete the state for the user', () => {
    const deleteStateMiddleware = deleteStateForUser(emulator);

    const req = {
      params: { userId: user.id },
      accepts: 'application/json',
      acceptsEncoding: 'utf8'
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: ''
    };

    const sendSpy = jest.spyOn(res, 'send');
    deleteStateMiddleware(req as any, res as any, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK);
    expect(emulator.facilities.botState.getBotData('3c', conversation.conversationId, user.id)).toEqual({
      'data': null,
      'eTag': '*'
    });
  });
});
