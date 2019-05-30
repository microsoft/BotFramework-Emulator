import './components/collapsibleJson.js';
import './components/collapsibleJsonNode.js';
import { CollapsibleJson } from './components/collapsibleJson';

const app = document.createElement('collapsible-json') as CollapsibleJson;
app.json = { a: 'hello', test: { b: 4 }, test2: { c: 5, d: 6 }, array: ['1', 2, 'e'] };

document.body.appendChild(app);
