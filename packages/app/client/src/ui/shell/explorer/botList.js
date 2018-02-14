import React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';
import PropTypes from 'prop-types';

import * as BotActions from '../../../data/action/botActions';
import { BotListItem } from './botListItem';
import { fuzzysearch } from '../../utils/fuzzySearch';

/*
    TODO: Decide on the structure / location of bots.json and each bot's bot file.
    (bots.json should probably be with or inside other local config / settings files)

    bots.json has the following structure:

    {
        "bots": [
            { "path": "C:\\{some path}\\bot1.bot" },

            ...

            { "path": "C:\\{some other path}\\bot3.bot" }
        ]
    }

    .bot files have the following structure:

    {
        "name": "my-test-bot",
        "handle": "my-test-bot",
        "icon": "https://www.mytestbot.com/static/boticon.png",
        "endpoint": "https://www.mytestbot.com/api/messages"
    }

 */
const BOTS_FILE_PATH = 'C:\\{ your_custom_path_to }\\bots.json';

const CSS = css({
    overflow: 'auto',

    '& > ul': {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },

    '& > ul > li.empty-bot-list': {
        width: '100%',
        height: '48px',
        padding: '12px 24px',
        boxSizing: 'border-box'
    }
});

const INPUT_CSS = css({
    minHeight: '24px',
    padding: '4px 8px'
});

export class BotList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onSelectBot = this.onSelectBot.bind(this);
        this.onQueryChange = this.onQueryChange.bind(this);

        this.state = { botQuery: '' };
    }

    componentDidMount() {
        // TODO: move this to a one-time action on app startup (doesn't currently work in main.js)
        this.props.dispatch(BotActions.loadBotsRequest(BOTS_FILE_PATH));
    }

    onSelectBot(e, handle) {
        this.props.dispatch(BotActions.setActive(handle));
    }

    onQueryChange(e) {
        const query = e.target.value;
        this.setState(({ botQuery: query }));
    }

    render() {
        let bots = this.state.botQuery ?
            this.props.bots.map(bot => fuzzysearch(this.state.botQuery, bot.handle) ? bot : null).filter(bot => !!bot)
        :
            this.props.bots;

        return (
            <React.Fragment>
                <input className={ INPUT_CSS } value={ this.state.botQuery } onChange={ this.onQueryChange } placeholder={ 'Search for a bot...' } />
                <div className={ CSS }>
                    <ul>
                        {
                            bots.length ?
                                bots.map(bot => <BotListItem key={ bot.handle } bot={ bot } onSelect={ this.onSelectBot } activeBot={ this.props.activeBot } />)
                            :
                                <li className="empty-bot-list">No bots found...</li>
                        }
                    </ul>
                </div>
            </React.Fragment>
        );
    }
}

export default connect((state, ownProps) => ({
    activeBot: state.bot.activeBot,
    bots: state.bot.bots
}))(BotList);

BotList.propTypes = {
    activeBot: PropTypes.string,
    bots: PropTypes.arrayOf(PropTypes.object)
};
