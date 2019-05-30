import { CollapsibleJsonNode } from './components/collapsibleJsonNode';

export function appendQuotedValue(parent: ParentNode, value: string, className: string, isKey: boolean = false): void {
  // Open quote
  parent.append(document.createTextNode('"'));
  // value
  const quotedNode = document.createElement('span');
  quotedNode.textContent = value;
  quotedNode.className = className;
  parent.append(quotedNode);
  // closed quote and colon
  parent.append(document.createTextNode(isKey ? '": ' : '"'));
}

export function appendUnquotedValue(parent: ParentNode, value: string, className: string): void {
  const unquotedNode = document.createElement('span');
  unquotedNode.textContent = value;
  unquotedNode.className = className;
  parent.append(unquotedNode);
}

/**
 * Recursively builds the nodes representing the
 * JSON data structure.
 *
 * @param parent The parent Element to append the child nodes to
 * @param data The object to represent as json data
 */
export function buildJsonNodes(parent: ParentNode, data: any): void {
  const keys = Object.keys(data);
  if (!keys.length) {
    return;
  }

  keys.forEach((key, index) => {
    const value = data[key];
    if (value === undefined) {
      return;
    }
    // Build the node holding this value and any children.
    // This will be the collapsible section if children are present
    const node = document.createElement('div');
    node.setAttribute('aria-role', 'treeitem');
    // array with children or object
    let appendComma = index !== keys.length - 1;
    if ((value !== null && value instanceof Array) || typeof value === 'object') {
      const collapsibleNode = document.createElement('collapsible-node') as CollapsibleJsonNode;
      collapsibleNode.setAttribute('contains-siblings', '' + appendComma);
      collapsibleNode.data = { [key]: value };
      node.appendChild(collapsibleNode);
      appendComma = false; // Comma is provided by contains-siblings attr
      // All other types
    } else {
      appendQuotedValue(node, key, 'json-key', true);
    }
    // null is an 'object' so we handle it explicitly
    if (value === null) {
      appendUnquotedValue(node, 'null', 'json-null');
    } else {
      switch (typeof value) {
        case 'string':
          appendQuotedValue(node, value, 'json-string');
          break;

        case 'number':
          appendUnquotedValue(node, '' + value, 'json-number');
          break;

        case 'boolean':
          appendUnquotedValue(node, '' + value, 'json-boolean');
          break;

        default:
          break;
      }
    }

    // Add the comma if we have children
    if (appendComma) {
      node.appendChild(document.createTextNode(','));
    }
    node.normalize();
    parent.append(node);
  });
}
