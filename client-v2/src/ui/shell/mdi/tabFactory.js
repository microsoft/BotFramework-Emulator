import React from 'react';

import * as constants from '../../../constants';
import BotTab from './botTab';
import CardTab from './cardTab';
import ConversationTab from './conversationTab';
import TestBedTab from './testBedTab';

export default props =>
    props.document.contentType === constants.ContentType_BotChat ?
        <BotTab botId={ props.document.documentId } />
    : props.document.contentType === constants.ContentType_Card ?
        <CardTab cardId={ props.document.documentId } />
    : props.document.contentType === constants.ContentType_Conversation ?
        <ConversationTab conversationId={ props.document.documentId } />
    : props.document.contentType === constants.ContentType_TestBed ?
        <TestBedTab />
    : false
