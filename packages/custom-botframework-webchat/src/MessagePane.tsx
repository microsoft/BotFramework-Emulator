import * as React from 'react';
import { Activity, CardAction, User, Message } from 'botframework-directlinejs';
import { ChatState } from './Store';
import { connect } from 'react-redux';
import { HScroll } from './HScroll';
import { classList, doCardAction, IDoCardAction } from './Chat';
import * as konsole from './Konsole';
import { ChatActions, sendMessage } from './Store';

export interface MessagePaneProps {
    children: React.ReactNode,
    doCardAction: IDoCardAction
}

const MessagePaneView = (props: MessagePaneProps) =>
    <div className='wc-message-pane'>
        { props.children }
    </div>;

export const MessagePane = connect(
    (state: ChatState) => ({
        // only used to create helper functions below
        botConnection: state.connection.botConnection,
        user: state.connection.user,
        locale: state.format.locale
    }), {
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): MessagePaneProps => ({
        // from ownProps
        children: ownProps.children,
        // helper functions
        doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
    })
)(MessagePaneView);
