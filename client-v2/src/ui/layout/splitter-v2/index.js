import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import SplitterV2Pane from './pane';
import SplitterV2Handle from './handle';

const CSS = css({
    position: 'relative'
});

export default class SplitterV2 extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.saveSplitterRef = this.saveSplitterRef.bind(this);
        this.savePrimaryPaneRef = this.savePrimaryPaneRef.bind(this);

        this.onGrabSplitter = this.onGrabSplitter.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.state = {
            resizing: false,
            primarySize: 500,
            secondarySize: 500
        };
    }

    componentWillMount() {
        // set up event listeners
        window.addEventListener('resize', console.log('resized window'));
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);

        this.SPLITTER_CSS = this.props.orientation === 'horizontal' ?

            css({
                height: '10px',
                width: '100%',
                backgroundColor: 'black'
            })
        :
            css({
                height: '100%',
                width: '10px',
                backgroundColor: 'black'
            });
    }

    componentWillUnmount() {
        // remove event listeners
        window.removeEventListener('resize');
        document.removeEventListener('mousemove');
        document.removeEventListener('mouseup');
    }

    saveContainerRef(element) {
        this.containerRef = element;
    }

    saveSplitterRef(element) {
        this.splitterRef = element;
    }

    savePrimaryPaneRef(element) {
        console.log(element)
        this.primaryPaneRef = element;
    }

    onGrabSplitter(e) {
        // start resizing
        console.log('got splitter grab');
        clearSelection();
        this.setState(({ resizing: true }));
    }

    onMouseMove(e) {
        // do calculation(s) and redraw panels
        if (this.state.resizing) {
            const containerSize = this.getContainerSize();
            const splitterSize = this.getSplitterSize();
            // if the splitter is horizontal, we just want the top of the container + the
            const primarySize = Math.max((containerSize.top + e.clientY), 200)
            const secondarySize = Math.max((containerSize.height - primarySize - splitterSize.height), 0);
            clearSelection();
            this.setState(({ primarySize, secondarySize }));
        }
    }

    getSplitterSize() {
        if (!this.cachedSplitterDimensions) {
            this.cachedSplitterDimensions = this.splitterRef.getBoundingClientRect();
        }
        return this.cachedSplitterDimensions;
        // const splitterDimensions = this.splitterRef.getBoundingClientRect();
        // return this.props.orientation === 'horizontal' ? splitterDimensions.width : splitterDimensions.height;
    }

    getContainerSize() {
        if (!this.cachedContainerDimensions) {
            this.cachedContainerDimensions = this.containerRef.getBoundingClientRect();
        }
        return this.cachedContainerDimensions;
        //const containerDimensions = this.containerRef.getBoundingClientRect();
        //return this.props.orientation === 'horizontal' ? containerDimensions.height : containerDimensions.width;
    }

    onMouseUp(e) {
        // stop resizing
        this.setState(({ resizing: false }));
    }

    render() {
        if (this.props.children.length === 2) {
            return (
                <div className={ CSS } ref={ this.saveContainerRef }>
                    <SplitterV2Pane size={ this.state.primarySize } ref={ this.savePrimaryPaneRef }>{ this.props.children[0] }</SplitterV2Pane>
                    <div className={ this.SPLITTER_CSS } orientation={ this.props.orientation } size={ 0 } onMouseDown={ this.onGrabSplitter } ref={ this.saveSplitterRef } />
                    <SplitterV2Pane size={ this.state.secondarySize }>{ this.props.children[1] }</SplitterV2Pane>
                </div>
            )
        }
        return false;
        // jam a splitter handle inbetween each pair of children
        /*const splitChildren = [];
        let splitterCount = 0;
        this.props.children.forEach((child, index) => {
            splitChildren.push(child);
            if (this.props.children[index + 1]) {
                const splitter = <SplitterV2Handle key={ splitterCount } orientation={ this.props.orientation } size={ 0 } onMouseDown={ this.onGrabSplitter } />;
                splitChildren.push(splitter);
                splitterCount++;
            }
        });

        return (
            <div className={ CSS }>
                { splitChildren }
            </div>
        );*/
    }
}

SplitterV2.propTypes = {
    orientation: PropTypes.oneOf([
        'horizontal',
        'vertical'
    ]).isRequired
}

function clearSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {
        document.selection.empty();
    }
}
