import React from 'react';
import ReactDom from 'react-dom';
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
        this.savePaneRef = this.savePaneRef.bind(this);

        this.onGrabSplitter = this.onGrabSplitter.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.activeSplitter = null;
        // [ { pane1Index: num, pane2Index: num, ref: splitterRef } ]
        this.splitters = [];
        this.splitNum = 0;
        // [ { size: num, ref: paneRef } ]
        this.panes = [];
        this.paneNum = 0;

        this.state = {
            resizing: false,
            primarySize: 500,
            secondarySize: 500,
            paneSizes: []
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
                backgroundColor: 'black',
                cursor: 'ns-resize'
            })
        :
            css({
                height: '100%',
                width: '10px',
                backgroundColor: 'black',
                cursor: 'ew-resize'
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

    /*saveSplitterRef(element) {
        this.splitterRef = element;
    }*/

    saveSplitterRef(element, index) {
        if (!this.splitters[index]) {
            this.splitters[index] = {};
        }
        this.splitters[index]['ref'] = element;
    }

    savePrimaryPaneRef(element) {
        this.primaryPaneRef = element;
    }

    savePaneRef(element, index) {
        if (!this.panes[index]) {
            this.panes[index] = {};
        }
        this.panes[index]['ref'] = ReactDom.findDOMNode(element);
    }

    /*onGrabSplitter(e) {
        // start resizing
        clearSelection();
        this.cachedSplitterDimensions = this.splitterRef.getBoundingClientRect();
        this.setState(({ resizing: true }));
    }*/

    onGrabSplitter(e, splitterIndex) {
        clearSelection();
        console.log('grabbed splitter: ', splitterIndex, this.splitters[splitterIndex])
        this.splitters[splitterIndex]['dimensions'] = this.splitters[splitterIndex]['ref'].getBoundingClientRect();
        this.activeSplitter = splitterIndex;
        this.setState(({ resizing: true }));
    }

    onMouseMove(e) {
        if (this.state.resizing) {
            this.performCalc(this.activeSplitter, e);
            clearSelection();
        }
    }

    /*onMouseMove(e) {
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
    }*/

    getSplitterSize() {
        return this.cachedSplitterDimensions;
    }

    performCalc(splitterIndex, e) {
        const pane1Index = this.splitters[splitterIndex]['pane1Index'];
        const pane2Index = this.splitters[splitterIndex]['pane2Index']
        const pane1Dimensions = this.panes[pane1Index]['ref'].getBoundingClientRect();
        const pane2Dimensions = this.panes[pane2Index]['ref'].getBoundingClientRect();
        const splitterDimensions = this.splitters[splitterIndex]['dimensions'];

        const primarySize = this.panes[pane1Index]['size'] = Math.max((pane1Dimensions.top + e.clientY), 100);
        const containerSize = pane1Dimensions.height + pane2Dimensions.height + splitterDimensions.height;
        const secondarySize = this.panes[pane2Index]['size'] = Math.max((containerSize - primarySize - splitterDimensions.height), 0);
        let currentPaneSizes = this.state.paneSizes;
        currentPaneSizes[pane1Index] = primarySize;
        currentPaneSizes[pane2Index] = secondarySize;
        this.setState(({ paneSizes: currentPaneSizes }));

        console.log({ 'primary': primarySize, 'secondary': secondarySize });
    }

    /*getContainerSize() {
        if (!this.cachedContainerDimensions) {
            this.cachedContainerDimensions = this.containerRef.getBoundingClientRect();
        }
        return this.cachedContainerDimensions;
        //const containerDimensions = this.containerRef.getBoundingClientRect();
        //return this.props.orientation === 'horizontal' ? containerDimensions.height : containerDimensions.width;
    }*/

    onMouseUp(e) {
        // stop resizing
        this.setState(({ resizing: false }));
    }

    render() {
        if (this.props.children.length === 2) {
            return (
                <div className={ CSS } ref={ this.saveContainerRef }>
                    <SplitterV2Pane orientation={ this.props.orientation } size={ this.state.primarySize } ref={ this.savePrimaryPaneRef }>{ this.props.children[0] }</SplitterV2Pane>
                    <div className={ this.SPLITTER_CSS } orientation={ this.props.orientation } size={ 0 } onMouseDown={ this.onGrabSplitter } ref={ this.saveSplitterRef } />
                    <SplitterV2Pane orientation={ this.props.orientation } size={ this.state.secondarySize }>{ this.props.children[1] }</SplitterV2Pane>
                </div>
            )
        }
        // jam a splitter handle inbetween each pair of children
        const splitChildren = [];
        this.paneNum = this.splitNum = 0;
        this.props.children.forEach((child, index) => {
            // add a pane
            if (!this.panes[this.paneNum]) {
                this.panes[this.paneNum] = {};
            }
            this.panes[this.paneNum]['size'] = 200;
            const paneIndex = this.paneNum;
            const pane = <SplitterV2Pane orientation={ this.props.orientation } size={ this.state.paneSizes[paneIndex] } ref={ x => this.savePaneRef(x, paneIndex) }>{ child }</SplitterV2Pane>;
            splitChildren.push(pane);

            // add a splitter if there is another child after this one
            if (this.props.children[index + 1]) {
                // record which panes this splitter controls
                if (!this.splitters[this.splitNum]) {
                    this.splitters[this.splitNum] = {};
                }
                this.splitters[this.splitNum]["pane1Index"] = this.paneNum;
                this.splitters[this.splitNum]["pane2Index"] = this.paneNum + 1;

                // add a splitter
                const splitIndex = this.splitNum;
                const splitter = <div className={ this.SPLITTER_CSS } key={ this.splitNum } ref={ x => this.saveSplitterRef(x, splitIndex) } orientation={ this.props.orientation } onMouseDown={ (e) => this.onGrabSplitter(e, splitIndex) } />;
                splitChildren.push(splitter);
                this.splitNum++;
            }

            this.paneNum++;
        });

        return (
            <div className={ CSS }>
                { splitChildren }
            </div>
        );
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
