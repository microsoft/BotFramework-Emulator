import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class ActionTextBox extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(evt) {
        this.props.dispatch(this.props.actionCreator(evt.target.value));
    }

    render() {
        return (
            <input
                onChange={ this.handleChange }
                placeholder={ this.props.placeholder }
                type="textbox"
                value={ this.props.value }
            />
        );
    }
}

ActionTextBox.propTypes = {
    actionCreator: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string
};

export default connect()(ActionTextBox);
