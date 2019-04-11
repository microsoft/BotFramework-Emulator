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
import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3';
// TODO: Revert import to `@bfemulator/sdk-shared` once issue #1333 (https://github.com/Microsoft/BotFramework-Emulator/issues/1333) is resolved.
import { json2HTML } from '@bfemulator/sdk-shared/build/utils/json2HTML';

import { BotState, HierarchicalData } from './types';
import { ViewState } from './ViewState';
import { buildHierarchicalData } from './utils';

export class BotStateVisualizer {
  get dataProvider(): BotState {
    return this._dataProvider;
  }

  set dataProvider(value: BotState) {
    if (this._dataProvider === value) {
      return;
    }
    this._dataProvider = value;
    if (value) {
      this.rebuildRootHierarchy();
    }
    this.render();
  }

  private readonly visualizerSelector: string;
  private readonly jsonSelector: string;
  private rootHierarchy: d3.HierarchyNode<{}>;
  private _viewState: ViewState;
  private _dataProvider: BotState;
  public isDiff: boolean;

  private static getNodeText(data: HierarchyPointNode<HierarchicalData>): string {
    let { name } = data.data;
    // filter out undefined only
    if (data.data.value !== undefined) {
      name += ': ' + data.data.value;
    }
    return name;
  }

  private resizeNodes(): d3.HierarchyPointNode<{}> {
    const root = this.rootHierarchy;
    return d3.cluster().nodeSize([15, (document.body.clientWidth - 250) / root.height])(root);
  }

  constructor(visualizerSelector: string, jsonSelector: string) {
    this.visualizerSelector = visualizerSelector;
    this.jsonSelector = jsonSelector;
    window.addEventListener('resize', () => this.render());
  }

  public get viewState(): ViewState {
    return this._viewState;
  }

  public set viewState(viewState: ViewState) {
    if (this._viewState === viewState) {
      return;
    }
    this._viewState = viewState;
    this.render();
  }

  public render = (): void => {
    const svg = d3.select(this.visualizerSelector);
    svg.selectAll('g').remove();

    const div = document.querySelector(this.jsonSelector);
    div.innerHTML = '';

    if (!this._dataProvider) {
      return;
    }

    // Rendering JSON
    if (this.viewState === ViewState.Json) {
      div.innerHTML = json2HTML(this._dataProvider);
      return;
    }

    // Rendering Dendrogram
    const root = this.resizeNodes();

    const g = svg
      .append('g')
      .attr('font-family', 'Menlo')
      .attr('font-size', 10);

    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d => `
        M${d.target.y},${d.target.x}
        C${d.source.y + 5},${d.target.x}
         ${d.source.y + 5},${d.source.x}
         ${d.source.y},${d.source.x}
      `
      );

    const node = g
      .append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants().reverse())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node
      .append('circle')
      .attr('fill', d => (d.children ? '#555' : '#999'))
      .attr('r', 2.5);

    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', d => (d.children ? -6 : 6))
      .text(BotStateVisualizer.getNodeText)
      .attr('class', this.getClassNameFromValueType)
      .filter((d: any) => d.children)
      .attr('text-anchor', 'end')
      .lower();

    const gRect = (g.node() as SVGElement).getBoundingClientRect();
    const svgRect = (svg.node() as SVGElement).getBoundingClientRect();
    svg.style('height', gRect.height);
    svg.style('width', gRect.width);

    // attempt to center the svg within the window
    const deltaY = (document.body.clientHeight - gRect.height) / 2;
    svg.attr('transform', `translate(0, ${Math.max(deltaY, 0)})`);
    // center the graphic tag within the svg
    g.attr('transform', `translate(70, ${Math.abs(gRect.top - svgRect.top)})`);
  };

  private getClassNameFromValueType = (data: HierarchyPointNode<HierarchicalData>): string => {
    const { name } = data.data;
    if (this.isDiff) {
      if (name.startsWith('+')) {
        return 'added';
      }
      if (name.startsWith('-')) {
        return 'removed';
      }
      return 'key';
    }
    const type = data.data.value ? typeof data.data.value : null;
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        return type;

      default:
        return 'null';
    }
  };

  private rebuildRootHierarchy() {
    const hierarchicalData = buildHierarchicalData(this._dataProvider);
    this.rootHierarchy = d3.hierarchy<any>(hierarchicalData).sort((a, b) => {
      if (!isNaN(+a.data.name) && !isNaN(+b.data.name)) {
        if (a.data.name < b.data.name) {
          return -1;
        }
        if (a.data.name > b.data.name) {
          return 1;
        }
        return 0;
      } else {
        return a.height - b.height;
      }
    });
  }
}
