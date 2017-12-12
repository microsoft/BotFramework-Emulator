import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Constants from '../constants';

export default class CommonDialog extends React.Component<any> {
    private closeButtonRef: any;

    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleHeaderFocusTrap = this.handleHeaderFocusTrap.bind(this);
        this.handleFooterFocusTrap = this.handleFooterFocusTrap.bind(this);
        this.saveCloseButton = this.saveCloseButton.bind(this);
    }

    componentDidMount() {
        this.props.onFocusNatural();
    }

    handleClose() {
        this.props.onClose();
    }

    handleHeaderFocusTrap() {
        // TODO: Can we automatically find all focusable elements?
        //       https://github.com/Microsoft/BotFramework-WebChat/pull/630
        this.props.onFocusLast();
    }

    handleFooterFocusTrap() {
        // TODO: Null check and noop on it
        (ReactDOM.findDOMNode(this.closeButtonRef) as HTMLElement).focus();
    }

    saveCloseButton(ref) {
        this.closeButtonRef = ref;
    }

    render() {
        return (
            <div>
                <div className="dialog-background" onClick={ this.handleClose }>
                </div>
                <div className="emu-dialog about-dialog">
                    <div tabIndex={ 0 } onFocus={ this.handleHeaderFocusTrap } />
                    <button type="button" className="dialog-closex" onClick={ this.handleClose } dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} ref={ this.saveCloseButton } />
                    { this.props.children }
                    <div tabIndex={ 0 } onFocus={ this.handleFooterFocusTrap } />
                </div>
            </div>
        );
    }
}
