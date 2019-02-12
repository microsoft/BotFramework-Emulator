import ConversationSet from './conversationSet';

describe('The conversationSet', () => {
  let conversationSet: ConversationSet;
  beforeEach(() => {
    conversationSet = new ConversationSet();
  });

  it('should create a new conversation and append "|livechat" to the conversatioId', () => {
    const conversation = conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId'
    );
    expect(conversation.conversationId).toBe('conversationId|livechat');
  });

  it('should not append "|livechat" to the conversationId when the conversationId contains "|transcript"', () => {
    const conversation = conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId|transcript'
    );
    expect(conversation.conversationId).toBe('conversationId|transcript');
  });

  it('should retrieve the conversation by id', () => {
    const conversation = conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId|transcript'
    );

    expect(conversationSet.conversationById('conversationId|transcript')).toBe(conversation);
  });

  it('should get all conversationsIds', () => {
    conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId|transcript'
    );
    conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId1|transcript'
    );

    const conversations = conversationSet.getConversationIds();
    expect(conversations).toEqual(['conversationId|transcript', 'conversationId1|transcript']);
  });
});
