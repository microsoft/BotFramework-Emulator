import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';
import TabBarTab from './tabBarTab';

const CSS = css({
    backgroundColor: 'magenta',
    display: 'flex',
    height: 30,
    listStyleType: 'none',
    margin: 0,
    padding: 0
});

export default class TabBar extends React.Component {
    render() {
        return (
            <ul className={ CSS }>
                {
                    React.Children.map(this.props.children, child =>
                        <li>{ child }</li>
                    )
                }
            </ul>
        );
    }
}

TabBar.propTypes = {
    value: PropTypes.number
};

