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
import * as React from 'react';

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  numSegments?: number;
  segmentRadius?: number;
  width?: number;
  height?: number;
}

export class Spinner extends React.Component<SpinnerProps, {}> {
  private animationFrame = 0;

  public render(): React.ReactNode {
    const { numSegments = 8, segmentRadius = 3, width = 40, height = 40, ...svgProps } = this.props;
    const segments = [];
    let i = numSegments;
    while (i--) {
      const deg = (360 / 1.5 / numSegments) * i;
      const opacity = (1 / 6) * i;
      segments.push(
        <circle
          style={{ opacity }}
          r={segmentRadius}
          cx={segmentRadius}
          cy={height / 2}
          transform={`rotate(${deg} ${width / 2} ${height / 2})`}
        />
      );
    }
    return (
      <svg ref={this.svgRef} {...svgProps}>
        <g>{segments}</g>
      </svg>
    );
  }

  private svgRef = (svg: SVGSVGElement): void => {
    if (!svg) {
      cancelAnimationFrame(this.animationFrame);
    }
    let lastTick = 0;
    let tickCt = 0;
    const tick = (time: number) => {
      const { numSegments = 8, width = 40, height = 40 } = this.props;
      // Animate every 4th frame
      const shouldTick = !!(time - lastTick > 50);
      if (shouldTick) {
        const deg = ((360 / 1.5 / numSegments) * tickCt) % 360;
        const { firstElementChild: g } = svg;
        g.setAttribute('transform', `rotate(${deg} ${width / 2} ${height / 2})`);
        tickCt++;
        lastTick = time;
      }
      this.animationFrame = requestAnimationFrame(tick);
    };
    this.animationFrame = requestAnimationFrame(tick);
  };
}
