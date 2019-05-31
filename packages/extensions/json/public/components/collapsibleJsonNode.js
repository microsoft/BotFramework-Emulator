import { appendQuotedValue, appendUnquotedValue, buildJsonNodes } from '../nodeBuilder.js';
export class CollapsibleJsonNode extends HTMLElement {
  constructor() {
    super(...arguments);
    this.fragment = document.createDocumentFragment();
  }
  static get observedAttributes() {
    return ['aria-expanded', 'contains-siblings'];
  }
  connectedCallback() {
    this.setAttribute('aria-role', 'group');
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.invalidateDom();
  }
  render() {
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
  renderCollapsedContent() {
    const [key] = Object.keys(this._data);
    const collapsedNode = document.createElement('span');
    collapsedNode.className = 'collapsed-node';
    appendQuotedValue(collapsedNode, key, 'json-key', true);
    appendUnquotedValue(collapsedNode, this._data[key] instanceof Array ? '[ ... ]' : '{ ... }', 'json-collapsed');
    this.fragment.append(collapsedNode);
  }
  renderExpandedContent() {
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
  invalidateDom() {
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
  get expandActuator() {
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
  get collapseActuator() {
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
  get data() {
    return this._data;
  }
  set data(value) {
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
