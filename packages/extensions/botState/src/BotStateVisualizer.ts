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

export class BotStateVisualizer {
  private readonly selector: string;
  private dataProvider: HierarchicalData;
  private isDiff: boolean;

  private static getDataProvider(botState: BotState): HierarchicalData {
    const dataProvider = { name: 'botState', children: [] };
    BotStateVisualizer.generateHierarchicalData(botState, dataProvider);

    return dataProvider;
  }

  private static getNodeText(data: HierarchyPointNode<HierarchicalData>): string {
    let { name } = data.data;
    // filter out undefined only
    if (data.data.value !== undefined) {
      name += ': ' + data.data.value;
    }
    return name;
  }

  public static generateHierarchicalData(data: any, parent: HierarchicalData) {
    Object.keys(data).forEach(key => {
      const child = { name: key } as HierarchicalData;
      if (data[key] !== null && typeof data[key] === 'object') {
        child.children = [];
        BotStateVisualizer.generateHierarchicalData(data[key], child);
      } else {
        child.value = data[key];
      }
      parent.children.push(child);
    });
  }

  private static buildTree(data: HierarchicalData) {
    const root = d3.hierarchy<any>(data).sort((a, b) => {
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
    return d3.cluster().nodeSize([15, (document.body.clientWidth - 250) / root.height])(root);
  }

  constructor(selector: string) {
    this.selector = selector;
    this.listen();
  }

  public renderTree = () => {
    const root = BotStateVisualizer.buildTree(this.dataProvider);
    const svg = d3.select(this.selector);
    svg.selectAll('g').remove();

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

    // Center the svg within the window
    svg.attr('transform', `translate(0, ${(document.body.clientHeight - gRect.height) / 2})`);
    // center the graphic tag within the svg
    g.attr('transform', `translate(70, ${Math.abs(gRect.top - svgRect.top)})`);
    return svg.node();
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
      return 'subtle';
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

  private listen() {
    window.addEventListener('resize', () => this.renderTree());
    if (!window.hasOwnProperty('host')) {
      return;
    }
    (window as any).host.on('inspect', (data: { value: BotState; valueType: string }) => {
      this.isDiff = data.valueType.endsWith('diff');
      this.dataProvider = BotStateVisualizer.getDataProvider(data.value);
      this.renderTree();
    });

    (window as any).host.on('theme', async themeInfo => {
      const oldThemeComponents = document.querySelectorAll('[data-theme-component="true"]');
      const head = document.querySelector('head');
      const fragment = document.createDocumentFragment();
      const promises = [];
      // Create the new links for each theme component
      themeInfo.themeComponents.forEach(themeComponent => {
        const link = document.createElement('link');
        promises.push(
          new Promise(resolve => {
            link.addEventListener('load', resolve);
          })
        );
        link.href = themeComponent;
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-component', 'true');
        fragment.appendChild(link);
      });
      head.insertBefore(fragment, head.firstElementChild);
      // Wait for all the links to load their css
      await Promise.all(promises);
      // Remove the old links
      oldThemeComponents.forEach(themeComponent => {
        if (themeComponent.parentElement) {
          themeComponent.parentElement.removeChild(themeComponent);
        }
      });
    });
  }
}

interface HierarchicalData {
  name: string;
  children?: HierarchicalData[];
  value?: string | boolean | number | null;
}

export interface BotState {
  conversationState: { [prop: string]: any };
  userState: { [prop: string]: any };
}
