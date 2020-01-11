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
// OF CONTRACT, TORT OR OTHERWISE , ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { MouseEvent } from 'react';

import { SplitterPane } from './pane';
import * as styles from './splitter.scss';

const DEFAULT_PANE_SIZE = 200;
const MIN_PANE_SIZE = 0;
const SPLITTER_SIZE = 0;

export type SplitterOrientation = 'horizontal' | 'vertical';

export interface SplitterProps {
  children?: any;
  initialSizes?: { [paneIndex: number]: number | string } | (() => { [paneIndex: number]: number | string });
  minSizes?: { [paneIndex: number]: number };
  onSizeChange?: (sizes: any[]) => any;
  orientation?: SplitterOrientation;
  primaryPaneIndex?: number;
}

export interface SplitterState {
  paneSizes?: number[];
}

/** Used to clear any text selected as a side effect of holding down the mouse and dragging */
function clearSelection(): void {
  const _document = document as any;
  if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (_document.selection) {
    _document.selection.empty();
  }
}

const mouseShield = document.createElement('div') as HTMLDivElement;
mouseShield.style.position = 'absolute';
mouseShield.style.top = '0';
mouseShield.style.right = '0';
mouseShield.style.bottom = '0';
mouseShield.style.left = '0';
mouseShield.style.zIndex = '9999';

export class Splitter extends React.Component<SplitterProps, SplitterState> {
  public static defaultProps: SplitterProps = {
    minSizes: {},
  };

  public state = {
    paneSizes: [],
  };

  private activeSplitter: any = null;
  private readonly splitters: any[] = [];
  private splitNum = 0;
  private readonly panes: any[] = [];
  private paneNum: number;
  private containerSize: number;
  private containerRef: HTMLElement;

  public componentWillMount() {
    window.addEventListener('resize', this.checkForContainerResize);
  }

  public componentDidMount() {
    this.calculateInitialPaneSizes();
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.checkForContainerResize);
  }

  public componentWillReceiveProps(nextProps: SplitterProps) {
    // if the number of children changes, recalculate pane sizes
    if (nextProps.children.length !== this.props.children.length) {
      this.props.children.length = nextProps.children.length;
      this.calculateInitialPaneSizes();
    }
  }

  public calculateInitialPaneSizes(): void {
    const currentPaneSizes = this.state.paneSizes;
    this.containerSize = this.getContainerSize();

    const numberOfPanes = this.props.children.length;
    const numberOfSplitters = numberOfPanes - 1;

    let defaultPaneSize;
    let initialSizes = this.props.initialSizes;
    if (initialSizes) {
      if (typeof initialSizes === 'function') {
        initialSizes = initialSizes();
      }
    }

    if (initialSizes) {
      // subtract initial sizes from container size and distribute the remaining size equally
      let remainingContainerSize = this.containerSize;
      let defaultPanes = numberOfPanes;
      Object.keys(initialSizes).forEach(key => {
        // convert percentage to absolute value if necessary
        initialSizes[key] =
          typeof initialSizes[key] === 'string'
            ? (parseInt(initialSizes[key], 10) / 100) * this.containerSize
            : initialSizes[key];

        if (isNaN(initialSizes[key])) {
          throw new Error(`Invalid value passed as element of initialSizes in Splitter: ${initialSizes[key]}`);
        }
        remainingContainerSize -= initialSizes[key];
        defaultPanes--;
      });
      defaultPaneSize = (remainingContainerSize - numberOfSplitters * SPLITTER_SIZE) / defaultPanes;
    } else {
      defaultPaneSize = (this.containerSize - numberOfSplitters * SPLITTER_SIZE) / numberOfPanes;
    }

    for (let i = 0; i < numberOfPanes; i++) {
      if (initialSizes && initialSizes[i]) {
        currentPaneSizes[i] = initialSizes[i];
      } else {
        currentPaneSizes[i] = defaultPaneSize;
      }
    }

    this.setState({ paneSizes: currentPaneSizes });
  }

  public getContainerSize(): number {
    if (this.containerRef) {
      const containerDimensions = this.containerRef.getBoundingClientRect();
      return this.props.orientation === 'horizontal' ? containerDimensions.height : containerDimensions.width;
    }
    return null;
  }

  public checkForContainerResize = (): void => {
    // only recalculate secondary panes if there is a specified primary pane
    if (this.props.primaryPaneIndex || this.props.primaryPaneIndex === 0) {
      // only recalculate pane sizes if the container's size has changed at all
      const oldContainerSize = this.containerSize;
      const newContainerSize = this.getContainerSize();

      if (newContainerSize !== oldContainerSize) {
        this.containerSize = newContainerSize;
        this.calculateSecondaryPaneSizes(oldContainerSize, newContainerSize);
      }
    }
  };

  public calculateSecondaryPaneSizes(oldContainerSize: number, newContainerSize: number): void {
    const containerSizeDelta = newContainerSize - oldContainerSize;

    // containerSizeDelta / number of secondary panes
    const secondaryPaneSizeAdjustment = containerSizeDelta / (this.panes.length - 1);

    // adjust each of the secondary panes to accomodate for the new container size
    const currentPaneSizes = this.state.paneSizes;
    for (let i = 0; i < currentPaneSizes.length; i++) {
      if (i !== this.props.primaryPaneIndex) {
        currentPaneSizes[i] = currentPaneSizes[i] + secondaryPaneSizeAdjustment;
      }
    }
    this.setState({ paneSizes: currentPaneSizes });
  }

  public saveContainerRef = (element: HTMLElement): void => {
    this.containerRef = element;
  };

  public saveSplitterRef = (element: HTMLElement, index: number): void => {
    if (!this.splitters[index]) {
      this.splitters[index] = {};
    }
    this.splitters[index].ref = element;
  };

  public savePaneRef = (element: SplitterPane, index: number): void => {
    if (!this.panes[index]) {
      this.panes[index] = {};
    }
    // eslint-disable-next-line react/no-find-dom-node
    this.panes[index].ref = ReactDom.findDOMNode(element);
  };

  private onActuatorMouseDown = (e: MouseEvent<HTMLDivElement>, splitterIndex: number): void => {
    clearSelection();
    // cache splitter dimensions
    this.splitters[splitterIndex].dimensions = this.splitters[splitterIndex].ref.getBoundingClientRect();
    this.activeSplitter = splitterIndex;
    // cache container size
    this.containerSize = this.getContainerSize();
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.body.insertBefore(mouseShield, document.body.firstElementChild);
  };

  public onMouseMove = (e: any): void => {
    this.checkForContainerResize();
    this.calculatePaneSizes(this.activeSplitter, e);
    clearSelection();
  };

  public calculatePaneSizes(splitterIndex: number, e: any): void {
    // get dimensions of both panes and the splitter
    const pane1Index = splitterIndex;
    const pane2Index = splitterIndex + 1;
    const pane1Dimensions = this.panes[pane1Index].ref.getBoundingClientRect();
    const pane2Dimensions = this.panes[pane2Index].ref.getBoundingClientRect();
    const splitterDimensions = this.splitters[splitterIndex].dimensions;

    // the primary pane's size will be the difference between the top (horizontal) or left (vertical) of the pane,
    // and the mouse's Y (horizontal) or X (vertical) position
    const { minSizes } = this.props;
    const condition1 = this.props.orientation === 'horizontal';
    const rightEval1 = () => {
      return (this.panes[pane1Index].size = Math.max(
        e.clientY - pane1Dimensions.top,
        minSizes[pane1Index] || MIN_PANE_SIZE
      ));
    };
    const leftEval1 = () => {
      return (this.panes[pane1Index].size = Math.max(
        e.clientX - pane1Dimensions.left,
        minSizes[pane1Index] || MIN_PANE_SIZE
      ));
    };
    let primarySize = condition1 ? rightEval1() : leftEval1();

    // the local container size will be the sum of the heights (horizontal)
    // or widths (vertical) of both panes and the splitter
    const localContainerSize =
      this.props.orientation === 'horizontal'
        ? pane1Dimensions.height + pane2Dimensions.height + splitterDimensions.height
        : pane1Dimensions.width + pane2Dimensions.width + splitterDimensions.width;

    // bound the bottom (horizontal) or right (vertical) of the primary pane to the bottom or right of the container
    const splitterSize = this.props.orientation === 'horizontal' ? splitterDimensions.height : splitterDimensions.width;
    if (primarySize + splitterSize > localContainerSize) {
      primarySize = localContainerSize - splitterSize;
    }

    // the secondary pane's size will be the remaining height (horizontal) or width (vertical)
    // left in the container after subtracting the size of the splitter and primary pane from the total size
    const condition2 = this.props.orientation === 'horizontal';
    const leftEval2 = () => {
      return (this.panes[pane2Index].size = Math.max(
        localContainerSize - primarySize - splitterDimensions.height,
        this.props.minSizes[pane2Index] || MIN_PANE_SIZE
      ));
    };
    const rightEval2 = () => {
      return (this.panes[pane2Index].size = Math.max(
        localContainerSize - primarySize - splitterDimensions.width,
        this.props.minSizes[pane2Index] || MIN_PANE_SIZE
      ));
    };
    const secondarySize = condition2 ? leftEval2() : rightEval2();

    const currentPaneSizes = this.state.paneSizes;
    currentPaneSizes[pane1Index] = primarySize;
    currentPaneSizes[pane2Index] = secondarySize;
    if (this.props.onSizeChange) {
      const globalContainerSize = this.getContainerSize();
      const paneSizes = currentPaneSizes.map(size => ({
        absolute: size,
        percentage: (size / globalContainerSize) * 100,
      }));
      this.props.onSizeChange(paneSizes);
    }
    this.setState({ paneSizes: currentPaneSizes });
  }

  public onMouseUp = (): void => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.body.removeChild(mouseShield);
  };

  public render(): JSX.Element {
    // jam a splitter handle inbetween each pair of children
    const splitChildren = [];
    this.paneNum = this.splitNum = 0;

    this.props.children.forEach((child, index) => {
      // take a 'snapshot' of the current indices or else
      // the elements will all use the same value once they are rendered
      const paneIndex = this.paneNum;
      const splitIndex = this.splitNum;

      // add a pane
      if (!this.panes[paneIndex]) {
        this.panes[paneIndex] = {};
      }
      this.panes[paneIndex].size = this.state.paneSizes[paneIndex] || DEFAULT_PANE_SIZE;
      const pane = (
        <SplitterPane
          key={`pane${paneIndex}`}
          orientation={this.props.orientation}
          size={this.state.paneSizes[paneIndex]}
          ref={x => this.savePaneRef(x, paneIndex)}
        >
          {child}
        </SplitterPane>
      );
      splitChildren.push(pane);

      // add a splitter if there is another child after this one
      if (this.props.children[index + 1]) {
        // record which panes this splitter controls
        if (!this.splitters[splitIndex]) {
          this.splitters[splitIndex] = {};
        }

        const splitterCss =
          this.props.orientation === 'horizontal' ? styles.horizontalSplitter : styles.verticalSplitter;
        // add a splitter
        const splitter = (
          <div className={splitterCss} key={`splitter${splitIndex}`} ref={x => this.saveSplitterRef(x, splitIndex)}>
            <div onMouseDown={e => this.onActuatorMouseDown(e, splitIndex)} />
          </div>
        );
        splitChildren.push(splitter);
        this.splitNum++;
      }

      this.paneNum++;
    });
    const flexDir = this.props.orientation === 'horizontal' ? styles.canvasCol : styles.canvasRow;
    return (
      <div ref={this.saveContainerRef} className={styles.container}>
        <div className={`${styles.floatingCanvas} ${flexDir}`}>{splitChildren}</div>
      </div>
    );
  }
}
