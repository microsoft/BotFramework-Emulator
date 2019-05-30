import { buildJsonNodes } from '../nodeBuilder.js';

export class CollapsibleJson extends HTMLElement {
  private _json: any;

  protected connectedCallback(): void {
    this.setAttribute('aria-role', 'tree');
  }

  /**
   * Renders the JSON data
   */
  protected render() {
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
  public get json(): any {
    return this._json;
  }

  public set json(value: any) {
    if (this._json === value) {
      return;
    }

    this._json = value;
    this.render();
  }
}

customElements.define('collapsible-json', CollapsibleJson);
