import React from 'react';

import CardTab from './cardTab';
import BotTab from './botTab';

import * as constants from '../../../constants';

export default props =>
    props.document.contentType === constants.ContentType_BotChat ?
        <BotTab document={ props.document } />
    : props.document.contentType === constants.ContentType_Card ?
        <CardTab document={ props.document } />
    : false
