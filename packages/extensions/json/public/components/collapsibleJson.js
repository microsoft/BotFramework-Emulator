import { buildJsonNodes } from '../nodeBuilder.js';
export class CollapsibleJson extends HTMLElement {
  connectedCallback() {
    this.setAttribute('aria-role', 'tree');
  }
  /**
   * Renders the JSON data
   */
  render() {
    while (this.firstElementChild) {
      this.removeChild(this.firstElementChild);
    }
    if (!this._json) {
      return;
    }
    const fragment = document.createDocumentFragment();
    buildJsonNodes(fragment, this._json);
    this.appendChild(fragment);
  }
  /**
   * gets/sets the json to be rendered.
   */
  get json() {
    return this._json;
  }
  set json(value) {
    if (this._json === value) {
      return;
    }
    this._json = value;
    this.render();
  }
}
customElements.define('collapsible-json', CollapsibleJson);
