const { remote } = window['require']('electron');
const { Menu } = remote;

export default function setupContextMenu() {
    const ContextMenuRW = Menu.buildFromTemplate([{
            label: 'Undo',
            role: 'undo',
        }, {
            label: 'Redo',
            role: 'redo',
        }, {
            type: 'separator',
        }, {
            label: 'Cut',
            role: 'cut',
        }, {
            label: 'Copy',
            role: 'copy',
        }, {
            label: 'Paste',
            role: 'paste',
        }
    ]);

    const ContextMenuRO = Menu.buildFromTemplate([{
            label: 'Undo',
            role: 'undo',
            enabled: false
        }, {
            label: 'Redo',
            role: 'redo',
            enabled: false
        }, {
            type: 'separator',
        }, {
            label: 'Cut',
            role: 'cut',
            enabled: false
        }, {
            label: 'Copy',
            role: 'copy',
            enabled: false
        }, {
            label: 'Paste',
            role: 'paste',
            enabled: false
        }
    ]);

    document.body.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let node: any = e.target;

        while (node) {
            if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
                if (node.readOnly) {
                    ContextMenuRO.popup(remote.getCurrentWindow());
                } else {
                    ContextMenuRW.popup(remote.getCurrentWindow());
                }
                break;
            }
            node = node.parentNode;
        }
    });
}
