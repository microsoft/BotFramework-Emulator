import * as React from "react";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  numSegments?: number;
  segmentRadius?: number;
  width?: number;
  height?: number;
}

export class Spinner extends React.Component<SpinnerProps, {}> {
  private animationFrame = 0;

  public render(): React.ReactNode {
    const {
      numSegments = 8,
      segmentRadius = 3,
      width = 40,
      height = 40,
      ...svgProps
    } = this.props;
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
        g.setAttribute(
          "transform",
          `rotate(${deg} ${width / 2} ${height / 2})`
        );
        tickCt++;
        lastTick = time;
      }
      this.animationFrame = requestAnimationFrame(tick);
    };
    this.animationFrame = requestAnimationFrame(tick);
  };
}
