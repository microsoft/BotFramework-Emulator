import './components/collapsibleJson.js';
import './components/collapsibleJsonNode.js';
import { CollapsibleJson } from './components/collapsibleJson';
import { WindowHostReceiver } from './services/windowHostReceiver.js';

const app = document.createElement('collapsible-json') as CollapsibleJson;
document.body.appendChild(app);
new WindowHostReceiver(app, (window as any).host);
