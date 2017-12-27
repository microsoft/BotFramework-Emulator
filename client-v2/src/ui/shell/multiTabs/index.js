import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

import TabBar from './tabBar';
import TabBarTab from './tabBarTab';

const CSS = css({
    backgroundColor: 'orange',
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
});

export default class MultiTabs extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTabClick = this.handleTabClick.bind(this);
    }

    handleTabClick(nextValue) {
        this.props.onChange && this.props.onChange(nextValue);
    }

    render() {
        return (
            <div className={ CSS }>
                <TabBar>
                    {
                        React.Children.map(this.props.children, (child, index) =>
                            <TabBarTab
                                onClick={ this.handleTabClick.bind(this, index) }
                            >
                                { child.props.title }
                            </TabBarTab>
                        )
                    }
                </TabBar>
                {
                    React.Children.toArray(this.props.children)[this.props.value]
                }
            </div>
        );
    }
}

MultiTabs.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.number
};

