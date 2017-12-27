import { connect } from 'react-redux';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import * as ServerActions from '../../data/action/serverActions';

const CSS = css({
});

const CONNECTED_CSS = css({
    backgroundColor: 'Green',
    color: 'White'
});

const DISCONNECTED_CSS = css({
    backgroundColor: 'Red',
    color: 'White'
});

class ConnectivityBadge extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.dispatch(ServerActions.ping());
    }

    render() {
        const { connectedHost, connectedVersion } = this.props;

        return (
            <button
                className={ classNames(CSS + '', {
                    [CONNECTED_CSS]: connectedVersion,
                    [DISCONNECTED_CSS]: connectedVersion === false
                }) }
                disabled={ !connectedVersion && connectedVersion !== false }
                onClick={ this.handleClick }
                type="button"
            >
                {
                    connectedVersion ?
                        `Connected to ${ connectedVersion } (${ connectedHost })`
                    : connectedVersion === false ?
                        'Not connected'
                    :
                        'Checking'
                }
            </button>
        );
    }
}

export default connect(state => ({
    connectedHost: state.server.get('connected') && state.server.get('host'),
    connectedVersion: state.server.get('connected') && state.server.get('version')
}))(ConnectivityBadge)
