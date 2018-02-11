import { Activity } from 'botframework-directlinejs';

interface Conversations {
  [key: string]: Conversation
}

const conversations: Conversations = {};

function createConversationID() {
  return `C_${ Math.random().toString(36).substr(2, 5) }`;
}

class Conversation {
  private messages: Message[] = [];
  private nextWatermark = 1;

  private ack(watermark) {
    this.messages = this.messages.filter(message => message.watermark > watermark);
  }

  getMessages(ackWatermark) {
    this.ack(ackWatermark);

    return this.messages[0];
  }

  pushMessage(content) {
    this.messages.push(new Message(this.nextWatermark, content));

    return this.nextWatermark++;
  }
}

export class Message {
  constructor(
    public watermark: number,
    public activity: Activity
  ) {}
}

export function createConversation() {
  const id = createConversationID();

  console.log(`Creating new conversation ${ id }`);
  conversations[id] = new Conversation();

  return id;
}

export function getMessage(conversationID: string, watermark: number): Message {
  return conversations[conversationID].getMessages(watermark);
}

export function pushMessage(conversationID: string, activity?: Activity) {
  return conversations[conversationID].pushMessage(activity);
}

export function endConversation(conversationID: string) {
  console.log(`Ending conversation ${ conversationID }`);
  delete conversations[conversationID];
}
