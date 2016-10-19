import * as React from 'react';


export class AddressBar extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar">
                <AddressBarStatus />
                <AddressBarTextBox />
                <AddressBarControl />
                <AddressBarMenu />
                <AddressBarSearch />
                <AddressBarBotCreds />
            </div>
        );
    }
}

class AddressBarStatus extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-status">
            &nbsp;
            </div>
        );
    }
}

interface IAddressBarTextBoxState {
    text: string
}

class AddressBarTextBox extends React.Component<{}, IAddressBarTextBoxState> {
    textInput:any;

    onChange: (text: string) => {
    }

    onKeyPress: (e) => {
    }

    onFocus: (e) => {
    }

    componentDidUpdate() {
        //this.textInput.focus();
    }

    render() {
        return (
            <div className="addressbar-textbox">
                <input
                    type="text"
                    ref={ ref => this.textInput = ref }
                    autoFocus
                    onChange={ e => this.onChange((e.target as any).value) }
                    onKeyPress={ e => this.onKeyPress(e) }
                    onFocus={ e => this.onFocus(e) }
                    placeholder="Enter your entpoint URL" />
            </div>
        );
    }
}

class AddressBarControl extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-control">
            &nbsp;
            </div>
        );
    }
}

class AddressBarMenu extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-menu">
            &nbsp;
            </div>
        );
    }
}

class AddressBarSearch extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-search">
            &nbsp;
            </div>
        );
    }
}

class AddressBarBotCreds extends React.Component<{}, {}> {

    render() {
        return (
            <div className="addressbar-botcreds">
            &nbsp;
            </div>
        );
    }
}
