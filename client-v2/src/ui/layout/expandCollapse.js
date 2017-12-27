import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

const CSS = css({
    '& > button': {
        width: '100%'
    }
});

export default class ExpandCollapse extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTitleClick = this.handleTitleClick.bind(this);

        this.state = {
            expanded: props.initialExpanded
        };
    }

    handleTitleClick() {
        this.setState(state => ({ expanded: !state.expanded }));
    }

    render() {
        return (
            <div className={ CSS }>
                <button onClick={ this.handleTitleClick }>
                    { this.state.expanded ? 'v' : '^' }&nbsp;
                    { this.props.title }
                </button>
                {
                    this.state.expanded &&
                        <div>
                            { this.props.children }
                        </div>
                }
            </div>
        );
    }
}

ExpandCollapse.defaultProps = {
    initialExpanded: false
};

ExpandCollapse.propTypes = {
    initialExpanded: PropTypes.bool
};
