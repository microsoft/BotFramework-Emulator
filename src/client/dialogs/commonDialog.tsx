import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Constants from '../constants';

export default class CommonDialog extends React.Component<any, any> {
    private closeButtonRef: any;

    constructor(props, context) {
        super(props, context);

        this.state = { style: null }

        this.handleClose = this.handleClose.bind(this);
        this.handleHeaderFocusTrap = this.handleHeaderFocusTrap.bind(this);
        this.handleFooterFocusTrap = this.handleFooterFocusTrap.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.saveCloseButton = this.saveCloseButton.bind(this);
        this.componentHandleNaturalFocus = this.componentHandleNaturalFocus.bind(this);
    }

    componentDidMount() {
        if (this.props.onFocusNatural) {
            this.props.onFocusNatural();
        } else {
            this.componentHandleNaturalFocus();
        }
    }

    componentWillMount() {
        this.setState(() => ({
            style: this.createStyle(this.props)
        }));
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.width !== nextProps.width
            || this.props.height !== nextProps.height
        ) {
            this.setState(() => ({
                style: this.createStyle(nextProps)
            }))
        }
    }

    componentHandleNaturalFocus() {
        const element = ReactDOM.findDOMNode(this.closeButtonRef) as HTMLElement;
        element && element.focus();
    }

    createStyle(props) {
        const { height, width} = props;

        return { height, width };
    }

    handleClose() {
        this.props.onClose();
    }

    handleKeyUp(event) {
        if (event.key === 'Escape') {
            this.handleClose();
        }
    }

    handleHeaderFocusTrap() {
        // TODO: Can we automatically find all focusable elements?
        //       https://github.com/Microsoft/BotFramework-WebChat/pull/630
        this.props.onFocusLast();
    }

    handleFooterFocusTrap() {
        const element = (ReactDOM.findDOMNode(this.closeButtonRef) as HTMLElement);

        element && element.focus();
    }

    saveCloseButton(ref) {
        this.closeButtonRef = ref;
    }

    render() {
        const classNames = ['emu-dialog'];

        this.props.className && classNames.push(this.props.className);

        return (
            <div onKeyUp={ this.handleKeyUp }>
                <div className="dialog-background" onClick={ this.handleClose } />
                <div style={ this.state.style } className={ classNames.join(' ') }>
                    <div tabIndex={ 0 } onFocus={ this.handleHeaderFocusTrap } />
                    <button type="button" className="dialog-closex" onClick={ this.handleClose } dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} ref={ this.saveCloseButton } />
                    { this.props.children }
                    <div tabIndex={ 0 } onFocus={ this.handleFooterFocusTrap } />
                </div>
            </div>
        );
    }
}
