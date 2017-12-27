import { css } from 'glamor';
import React from 'react';

export default class EmulatorEditor extends React.Component {
    render() {
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
}
