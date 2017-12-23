import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardEditor from './AdaptiveCardEditor';
import BotChatEditor from './BotChatEditor';

export { AdaptiveCardEditor, BotChatEditor }

export default class Editor extends React.Component {
    render() {
        const { document } = this.props;
        const { contentType } = document;

        return (
            contentType === 'application/vnd.microsoft.card.adaptive' ?
                <AdaptiveCardEditor />
            : contentType === 'application/vnd.microsoft.botframework.bot' ?
                <BotChatEditor
                    directLineURL={ document.directLineURL }
                />
            :
                false
        );
    }
}

Editor.propTypes = {
    document: PropTypes.shape({
        contentType: PropTypes.string
    })
};
