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
  private dx: number = 0;
  private dy: number = 0;

  private static getDataProvider(botState: BotState): HierarchicalData {
    const dataProvider = { name: 'botState', children: [] };
    BotStateVisualizer.getChildren(botState, dataProvider);

    return dataProvider;
  }

  private static getClassNameFromValueType(data: HierarchyPointNode<HierarchicalData>): string {
    const type = data.data.value ? typeof data.data.value : null;
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        return type;

      default:
        return 'null';
    }
  }

  private static getNodeText(data: HierarchyPointNode<HierarchicalData>): string {
    let { name } = data.data;
    if (data.data.value !== undefined) {
      // filter out undefined only
      name += ': ' + data.data.value;
    }
    return name;
  }

  public static getChildren(data: any, parent: HierarchicalData) {
    Object.keys(data).forEach(key => {
      const child = { name: key } as HierarchicalData;
      if (data[key] !== null && typeof data[key] === 'object') {
        child.children = [];
        BotStateVisualizer.getChildren(data[key], child);
      } else {
        child.value = data[key];
      }
      parent.children.push(child);
    });
  }

  constructor(selector: string) {
    this.selector = selector;
    this.listen();
  }

  public renderTree() {
    const root = this.tree(this.dataProvider);

    const svg = d3.select(this.selector);

    svg.selectAll('g').remove();

    const g = svg
      .append('g')
      .attr('font-family', 'Menlo')
      .attr('font-size', 10)
      .attr('transform', `translate(70, 35)`);

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
        C${d.source.y + this.dy / 2},${d.target.x}
         ${d.source.y + this.dy / 2},${d.source.x}
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
      .attr('class', BotStateVisualizer.getClassNameFromValueType)
      .filter((d: any) => d.children)
      .attr('text-anchor', 'end')
      .lower();

    svg.style('height', (g.node() as SVGElement).getBoundingClientRect().height);
    svg.style('width', (g.node() as SVGElement).getBoundingClientRect().width);
    return svg.node();
  }

  private listen() {
    if (!window.hasOwnProperty('host')) {
      return;
    }
    (window as any).host.on('inspect', (data: { value: BotState }) => {
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
      Array.prototype.forEach.call(oldThemeComponents, themeComponent => {
        if (themeComponent.parentElement) {
          themeComponent.parentElement.removeChild(themeComponent);
        }
      });
    });
  }

  private tree(data: any) {
    const root = d3.hierarchy<any>(data).sort((a, b) => {
      return a.height - b.height || a.data.name.localeCompare(b.data.name);
    });
    this.dx = 10;
    this.dy = document.body.clientHeight / (root.height + 1);
    return d3.cluster().nodeSize([15, document.body.clientWidth / (root.height + 9)])(root);
  }
}

interface HierarchicalData {
  name: string;
  children?: HierarchicalData[];
  value?: string | boolean | number | null;
}

interface BotState {
  conversationState: { [prop: string]: any };
  userState: { [prop: string]: any };
}

const visualizer = new BotStateVisualizer('#bot-state-visualizer');
window.addEventListener('resize', () => {
  visualizer.renderTree();
});
