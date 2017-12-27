import React from 'react';
import { css } from 'glamor';

export default class EmulatorEditor extends React.Component {
    render() {
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
}
