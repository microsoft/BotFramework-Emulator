"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const React = require("react");
const Attachment_1 = require("./Attachment");
const Carousel_1 = require("./Carousel");
const FormattedText_1 = require("./FormattedText");
const Attachments = (props) => {
    const { attachments, attachmentLayout } = props, otherProps = tslib_1.__rest(props, ["attachments", "attachmentLayout"]);
    if (!attachments || attachments.length === 0)
        return null;
    return attachmentLayout === 'carousel' ?
        React.createElement(Carousel_1.Carousel, Object.assign({ attachments: attachments }, otherProps))
        :
            React.createElement("div", { className: "wc-list" }, attachments.map((attachment, index) => React.createElement(Attachment_1.AttachmentView, { key: index, attachment: attachment, format: props.format, onCardAction: props.onCardAction, onImageLoad: props.onImageLoad })));
};
class ActivityView extends React.Component {
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps) {
        // if the activity changed, re-render
        return this.props.activity !== nextProps.activity
            // if the format changed, re-render
            || this.props.format !== nextProps.format
            // if it's a carousel and the size changed, re-render
            || (this.props.activity.type === 'message'
                && this.props.activity.attachmentLayout === 'carousel'
                && this.props.size !== nextProps.size);
    }
    render() {
        const _a = this.props, { activity } = _a, props = tslib_1.__rest(_a, ["activity"]);
        switch (activity.type) {
            case 'message':
                return (React.createElement("div", null,
                    React.createElement(FormattedText_1.FormattedText, { text: activity.text, format: activity.textFormat, onImageLoad: props.onImageLoad }),
                    React.createElement(Attachments, { attachments: activity.attachments, attachmentLayout: activity.attachmentLayout, format: props.format, onCardAction: props.onCardAction, onImageLoad: props.onImageLoad, size: props.size })));
            case 'typing':
                return React.createElement("div", { className: "wc-typing" });
        }
    }
}
exports.ActivityView = ActivityView;
//# sourceMappingURL=ActivityView.js.map