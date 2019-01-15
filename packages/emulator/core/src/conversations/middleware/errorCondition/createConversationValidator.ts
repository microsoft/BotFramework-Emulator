import * as HttpStatus from 'http-status-codes';
import BotEndpoint from '../../../facility/botEndpoint';
import ConversationParameters from '../../../types/activity/conversationParameters';
import APIException from '../../../types/apiException';
import { ErrorCodes } from '../../../types/errorCodes';
import createAPIException from '../../../utils/createResponse/apiException';

class CreateConversationError {
  public static MEMBERS_MISSING = new CreateConversationError(
    ErrorCodes.MissingProperty,
    'The "members" parameter is required.');

  public static TOO_MANY_MEMBERS = new CreateConversationError(
    ErrorCodes.BadSyntax,
    'The Emulator only supports creating conversation with 1 member.');

  public static BOT_MISSING = new CreateConversationError(
    ErrorCodes.MissingProperty,
    'The "Bot" parameter is required'
  );

  public static BOT_ID_MISMATCH = new CreateConversationError(
    ErrorCodes.BadArgument,
    'conversationParameters.bot.id doesn\'t match security bot id'
  );

  public static APP_ID_MISSING = new CreateConversationError(
    ErrorCodes.MissingProperty,
    'The Emulator only supports bot-created conversation with AppID-bearing bot'
  );

  constructor(public errorCode: ErrorCodes, public message: string) {
    if (Object.isFrozen(CreateConversationError)) {
      throw new Error('The CreateConversationError cannot be constructed');
    }
    Object.assign(this, { errorCode, message });
    Object.freeze(this);
  }

  public toAPIException(): APIException {
    return createAPIException(HttpStatus.BAD_REQUEST, this.errorCode, this.message);
  }
}

Object.freeze(CreateConversationError);

function validateCreateConversationRequest(params: ConversationParameters, endpoint: BotEndpoint)
  : CreateConversationError {
  if (!params.members) {
    return CreateConversationError.MEMBERS_MISSING;
  }

  if (params.members.length !== 1) {
    return CreateConversationError.TOO_MANY_MEMBERS;
  }

  if (!params.bot) {
    return CreateConversationError.BOT_MISSING;

  }

  if (!endpoint) {
    return CreateConversationError.APP_ID_MISSING;
  }
}

export { CreateConversationError, validateCreateConversationRequest };

// tslint:disable-next-line:no-consecutive-blank-lines