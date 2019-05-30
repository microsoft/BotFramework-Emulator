import { appendQuotedValue, appendUnquotedValue, buildJsonNodes } from '../nodeBuilder.js';

export class CollapsibleJsonNode extends HTMLElement {
  private _data: any;
  private _collapseActuator: HTMLDivElement;
  private _expandActuator: HTMLDivElement;

  private fragment = document.createDocumentFragment();
  private renderOnNextTick: number;

  protected static get observedAttributes(): string[] {
    return ['aria-expanded', 'contains-siblings'];
  }

  protected connectedCallback(): void {
    this.setAttribute('aria-role', 'group');
  }

  protected attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    this.invalidateDom();
  }

  protected render(): void {
    this.textContent = '';
    if (!this._data) {
      return;
    }
    const collapsed = this.getAttribute('aria-expanded') === 'false';
    const containsSiblings = this.getAttribute('contains-siblings') === 'true';
    collapsed ? this.renderCollapsedContent() : this.renderExpandedContent();

    if (containsSiblings) {
      this.fragment.appendChild(document.createTextNode(','));
    }
    this.fragment.append(collapsed ? this.expandActuator : this.collapseActuator);
    this.appendChild(this.fragment);
  }

  protected renderCollapsedContent(): void {
    const [key] = Object.keys(this._data);

    const collapsedNode = document.createElement('span');
    collapsedNode.className = 'collapsed-node';
    appendQuotedValue(collapsedNode, key, 'json-key', true);
    appendUnquotedValue(collapsedNode, this._data[key] instanceof Array ? '[ ... ]' : '{ ... }', 'json-collapsed');

    this.fragment.append(collapsedNode);
  }

  protected renderExpandedContent(): void {
    const { fragment } = this;
    const [key] = Object.keys(this._data);

    appendQuotedValue(fragment, key, 'json-key', true);
    if (this._data[key] instanceof Array) {
      fragment.appendChild(document.createTextNode('['));
      buildJsonNodes(fragment, this._data[key]);
      fragment.appendChild(document.createTextNode(']'));
    } else {
      fragment.appendChild(document.createTextNode('{'));
      buildJsonNodes(fragment, this._data[key]);
      fragment.appendChild(document.createTextNode('}'));
    }
  }

  protected invalidateDom(): void {
    if (this.renderOnNextTick) {
      return;
    }
    this.renderOnNextTick = requestAnimationFrame(() => {
      this.renderOnNextTick = null;
      this.render();
    });
  }

  /**
   * Gets the expand actuator which presents as a
   * right pointing arrow via css
   */
  private get expandActuator(): HTMLDivElement {
    if (this._expandActuator) {
      return this._expandActuator;
    }

    const actuator = (this._expandActuator = document.createElement('div'));
    actuator.setAttribute('aria-role', 'button');
    actuator.className = 'expand-actuator';
    actuator.addEventListener('click', () => {
      this.setAttribute('aria-expanded', 'true');
    });
    return actuator;
  }

  /**
   * Gets the collapse actuator which presents as two
   * arrows with a line spanning the height of the node.
   */
  private get collapseActuator(): HTMLDivElement {
    if (this._collapseActuator) {
      return this._collapseActuator;
    }

    const actuator = (this._collapseActuator = document.createElement('div'));
    actuator.setAttribute('aria-role', 'button');
    actuator.className = 'collapse-actuator';
    actuator.addEventListener('click', () => {
      this.setAttribute('aria-expanded', 'false');
    });

    return actuator;
  }

  public get data(): any {
    return this._data;
  }

  public set data(value: any) {
    if (this._data === value) {
      return;
    }
    if ((value && value instanceof Array) || typeof value === 'object') {
      this._data = value;
      this.invalidateDom();
    } else {
      throw new TypeError('Expecting Array or Object but got: ' + value);
    }
  }
}

customElements.define('collapsible-node', CollapsibleJsonNode);
