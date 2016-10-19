import * as React from 'react';


export class AddressBar extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar">
                <AddressBarStatus />
                <AddressBarTextBox />
                <AddressBarControl />
                <AddressBarMenu />
            </div>
        );
    }
}

class AddressBarStatus extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-status">
            </div>
        );
    }
}

class AddressBarTextBox extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-status">
            </div>
        );
    }
}

class AddressBarControl extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-control">
            </div>
        );
    }
}

class AddressBarMenu extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-menu">
            </div>
        );
    }
}
