import React from 'react';
import CardTab from './cardTab';
import BotTab from './botTab';
import ConversationTab from './conversationTab';
import * as constants from '../../../constants';

export default props =>
    props.document.contentType === constants.ContentType_BotChat ?
        <BotTab document={ props.document } />
    : props.document.contentType === constants.ContentType_Card ?
        <CardTab document={ props.document } />
    : props.document.contentType === constants.ContentType_Converation ?
        <ConversationTab document={ props.document } />
    : false
