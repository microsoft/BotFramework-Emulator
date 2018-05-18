"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const React = require("react");
const Attachment_1 = require("./Attachment");
const HScroll_1 = require("./HScroll");
const konsole = require("./Konsole");
class Carousel extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    updateContentWidth() {
        //after the attachments have been rendered, we can now measure their actual width
        const width = this.props.size.width - this.props.format.carouselMargin;
        //important: remove any hard styling so that we can measure the natural width
        this.root.style.width = '';
        //now measure the natural offsetWidth
        if (this.root.offsetWidth > width) {
            // the content width is bigger than the space allotted, so we'll clip it to force scrolling
            this.root.style.width = width.toString() + "px";
            // since we're scrolling, we need to show scroll buttons
            this.hscroll.updateScrollButtons();
        }
    }
    componentDidMount() {
        this.updateContentWidth();
    }
    componentDidUpdate() {
        this.updateContentWidth();
    }
    render() {
        return (React.createElement("div", { className: "wc-carousel", ref: div => this.root = div },
            React.createElement(HScroll_1.HScroll, { ref: hscroll => this.hscroll = hscroll, prevSvgPathData: "M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z", nextSvgPathData: "M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z", scrollUnit: "item" },
                React.createElement(CarouselAttachments, Object.assign({}, this.props)))));
    }
}
exports.Carousel = Carousel;
class CarouselAttachments extends React.PureComponent {
    render() {
        konsole.log("rendering CarouselAttachments");
        const _a = this.props, { attachments } = _a, props = tslib_1.__rest(_a, ["attachments"]);
        return (React.createElement("ul", null, this.props.attachments.map((attachment, index) => React.createElement("li", { key: index, className: "wc-carousel-item" },
            React.createElement(Attachment_1.AttachmentView, { attachment: attachment, format: props.format, onCardAction: props.onCardAction, onImageLoad: props.onImageLoad })))));
    }
}
//# sourceMappingURL=Carousel.js.map