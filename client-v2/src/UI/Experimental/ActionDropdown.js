import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

class ActionDropdown extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(evt) {
        const { actionCreator } = this.props;

        actionCreator && this.props.dispatch(actionCreator(evt.target.value));
    }

    render() {
        return (
            <select
                onChange={ this.handleChange }
                value={ this.props.value }
            >
                { this.props.children }
            </select>
        );
    }
}

ActionDropdown.Option = props => {
    return <option value={ props.value }>{ props.children }</option>;
};

ActionDropdown.propTypes = {
    actionCreator: PropTypes.func,
    value: PropTypes.string
};

export default connect()(ActionDropdown)
