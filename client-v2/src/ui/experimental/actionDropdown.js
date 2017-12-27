//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

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
