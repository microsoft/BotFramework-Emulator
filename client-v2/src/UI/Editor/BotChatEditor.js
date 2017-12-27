import { css } from 'glamor';
import React from 'react';

import { MainView } from '../../v1/mainView';

const CSS = css({
    flex: 1,
    position: 'relative'
});

export default class BotChatEditor extends React.Component {
    render() {
        return (
            <div className={ CSS }>
                <MainView />
            </div>
        );
    }
}
