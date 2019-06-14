import { BotEmulator } from '../../botEmulator';
import ConversationSet from '../../facility/conversationSet';
import Users from '../../facility/users';
import Endpoints from '../../facility/endpointSet';
import Attachments from '../../facility/attachments';

import getConversationEndpoint from './getConversationEndpoint';
import BotEndpoint from '../../facility/botEndpoint';

describe('The conversations middleware', () => {
  let emulator: BotEmulator;
  let res;
  let sentResponses;
  beforeEach(() => {
    sentResponses = [];
    res = {
      json: (...args) => sentResponses.push(args),
      end: () => null,
      contentType: '',
    };
    emulator = createEmulatorUtil();
  });

  it('should get the endpoint from the specific conversation', () => {
    const targetEndpoint = new BotEndpoint('1234');
    const targetConversation = emulator.facilities.conversations.newConversation(emulator, targetEndpoint, {
      name: 'User',
      id: '1234',
    });
    const getConversationEndpointMiddleware = getConversationEndpoint(emulator);
    const req = { params: { conversationId: targetConversation.conversationId } };
    getConversationEndpointMiddleware(req as any, res, (() => null) as any);

    expect(sentResponses[0][0]).toBe(200);
    expect(sentResponses[0][1]).toBe(targetEndpoint);
  });
});

function createEmulatorUtil(): BotEmulator {
  const emulator = {
    facilities: { logger: { logMessage: () => true } },
  } as any;
  emulator.facilities.conversations = new ConversationSet();
  emulator.facilities.users = new Users();
  emulator.facilities.users.currentUserId = '456';
  emulator.facilities.endpoints = new Endpoints(emulator);
  emulator.facilities.logger = { logActivity: () => null } as any;
  emulator.facilities.attachments = new Attachments();
  emulator.options = {};

  return emulator;
}
