import * as React from 'react';
import { Activity, Message, User, CardActionTypes } from 'botframework-directlinejs';
import { ChatState, FormatState, SizeState } from './Store';
import { Dispatch, connect } from 'react-redux';
import { ActivityView } from './ActivityView';
import { classList, doCardAction, IDoCardAction } from './Chat';
import * as konsole from './Konsole';
import { sendMessage } from './Store';

export interface HistoryProps {
    format: FormatState,
    size: SizeState,
    activities: Activity[],

    setMeasurements: (carouselMargin: number) => void,
    onClickRetry: (activity: Activity) => void,
    onClickCardAction: () => void,

    isFromMe: (activity: Activity) => boolean,
    isSelected: (activity: Activity) => boolean,
    onClickActivity: (activity: Activity) => React.MouseEventHandler<HTMLDivElement>,

    onCardAction: () => void,
    doCardAction: IDoCardAction
}

export class HistoryView extends React.Component<HistoryProps, {}> {
    private scrollMe: HTMLDivElement;
    private scrollContent: HTMLDivElement;
    private scrollToBottom = true;

    private carouselActivity: WrappedActivity;
    private largeWidth: number;

    constructor(props: HistoryProps) {
        super(props);
    }

    componentWillUpdate() {
        this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= 1);
    }

    componentDidUpdate() {
        if (this.props.format.carouselMargin == undefined) {
            // After our initial render we need to measure the carousel width

            // Measure the message padding by subtracting the known large width
            const paddedWidth = measurePaddedWidth(this.carouselActivity.messageDiv) - this.largeWidth;

            // Subtract the padding from the offsetParent's width to get the width of the content
            const maxContentWidth = (this.carouselActivity.messageDiv.offsetParent as HTMLElement).offsetWidth - paddedWidth;

            // Subtract the content width from the chat width to get the margin.
            // Next time we need to get the content width (on a resize) we can use this margin to get the maximum content width
            const carouselMargin = this.props.size.width - maxContentWidth;

            konsole.log('history measureMessage ' + carouselMargin);

            // Finally, save it away in the Store, which will force another re-render
            this.props.setMeasurements(carouselMargin)

            this.carouselActivity = null; // After the re-render this activity doesn't exist
        }

        this.autoscroll();
    }

    private autoscroll() {
        const vAlignBottomPadding = Math.max(0, measurePaddedHeight(this.scrollMe) - this.scrollContent.offsetHeight);
        this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';

        const lastActivity = this.props.activities[this.props.activities.length - 1];
        const lastActivityFromMe = lastActivity && this.props.isFromMe && this.props.isFromMe(lastActivity);

        // Validating if we are at the bottom of the list or the last activity was triggered by the user.
        if (this.scrollToBottom || lastActivityFromMe) {
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
        }
    }

    // In order to do their cool horizontal scrolling thing, Carousels need to know how wide they can be.
    // So, at startup, we create this mock Carousel activity and measure it.
    private measurableCarousel = () =>
        // find the largest possible message size by forcing a width larger than the chat itself
        <WrappedActivity
            ref={ x => this.carouselActivity = x }
            activity={ {
                type: 'message',
                id: '',
                from: { id: '' },
                attachmentLayout: 'carousel'
            } }
            format={ null }
            fromMe={ false }
            onClickActivity={ null }
            onClickRetry={ null }
            selected={ false }
            showTimestamp={ false }
        >
            <div style={ { width: this.largeWidth } }>&nbsp;</div>
        </WrappedActivity>;

    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (not much needs to actually render here)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity

    private doCardAction(type: CardActionTypes, value: string | object) {
        this.props.onClickCardAction();
        this.props.onCardAction && this.props.onCardAction();
        return this.props.doCardAction(type, value);
    }

    render() {
        konsole.log("History props", this);
        let content;
        if (this.props.size.width !== undefined) {
            if (this.props.format.carouselMargin === undefined) {
                // For measuring carousels we need a width known to be larger than the chat itself
                this.largeWidth = this.props.size.width * 2;
                content = <this.measurableCarousel/>;
            } else {
                content = this.props.activities.map((activity, index) =>
                    <WrappedActivity
                        format={ this.props.format }
                        key={ 'message' + index }
                        activity={ activity }
                        showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
                        selected={ this.props.isSelected(activity) }
                        fromMe={ this.props.isFromMe(activity) }
                        onClickActivity={ this.props.onClickActivity(activity) }
                        onClickRetry={ e => {
                            // Since this is a click on an anchor, we need to stop it
                            // from trying to actually follow a (nonexistant) link
                            e.preventDefault();
                            e.stopPropagation();
                            this.props.onClickRetry(activity)
                        } }
                    >
                        <ActivityView
                            format={ this.props.format }
                            size={ this.props.size }
                            activity={ activity }
                            onCardAction={ (type: CardActionTypes, value: string | object) => this.doCardAction(type, value) }
                            onImageLoad={ () => this.autoscroll() }
                        />
                    </WrappedActivity>
                );
            }
        }

        const groupsClassName = classList('wc-message-groups', !this.props.format.options.showHeader && 'no-header');

        return (
            <div
                className={ groupsClassName }
                ref={ div => this.scrollMe = div || this.scrollMe }
                role="log"
                tabIndex={ 0 }
            >
                <div className="wc-message-group-content" ref={ div => { if (div) this.scrollContent = div }}>
                    { content }
                </div>
            </div>
        );
    }
}

export const History = connect(
    (state: ChatState) => ({
        // passed down to HistoryView
        format: state.format,
        size: state.size,
        activities: state.history.activities,
        // only used to create helper functions below
        connectionSelectedActivity: state.connection.selectedActivity,
        selectedActivity: state.history.selectedActivity,
        botConnection: state.connection.botConnection,
        user: state.connection.user
    }), {
        setMeasurements: (carouselMargin: number) => ({ type: 'Set_Measurements', carouselMargin }),
        onClickRetry: (activity: Activity) => ({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId }),
        onClickCardAction: () => ({ type: 'Card_Action_Clicked'}),
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): HistoryProps => ({
        // from stateProps
        format: stateProps.format,
        size: stateProps.size,
        activities: stateProps.activities,
        // from dispatchProps
        setMeasurements: dispatchProps.setMeasurements,
        onClickRetry: dispatchProps.onClickRetry,
        onClickCardAction: dispatchProps.onClickCardAction,
        // helper functions
        doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.format.locale, dispatchProps.sendMessage),
        isFromMe: (activity: Activity) => activity.from.id === stateProps.user.id,
        isSelected: (activity: Activity) => activity === stateProps.selectedActivity,
        onClickActivity: (activity: Activity) => stateProps.connectionSelectedActivity && (() => stateProps.connectionSelectedActivity.next({ activity })),
        onCardAction: ownProps.onCardAction
    }), {
        withRef: true
    }
)(HistoryView);

const getComputedStyleValues = (el: HTMLElement, stylePropertyNames: string[]) => {
    const s = window.getComputedStyle(el);
    const result: { [key: string]: number } = {};
    stylePropertyNames.forEach(name => result[name] = parseInt(s.getPropertyValue(name)));
    return result;
}

const measurePaddedHeight = (el: HTMLElement): number => {
    const paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
    const values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
    return el.offsetHeight - values[paddingTop] - values[paddingBottom];
}

const measurePaddedWidth = (el: HTMLElement): number => {
    const paddingLeft = 'padding-left', paddingRight = 'padding-right';
    const values = getComputedStyleValues(el, [paddingLeft, paddingRight]);
    return el.offsetWidth + values[paddingLeft] + values[paddingRight];
}

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

export interface WrappedActivityProps {
    activity: Activity,
    showTimestamp: boolean,
    selected: boolean,
    fromMe: boolean,
    format: FormatState,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {
    public messageDiv: HTMLDivElement;

    constructor(props: WrappedActivityProps) {
        super(props);
    }

    render () {
        let timeLine: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = <span>{ this.props.format.strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ this.props.format.strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
                    <span>
                        { this.props.format.strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ this.props.onClickRetry }>{ this.props.format.strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp)
                    sent = this.props.format.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        }

        const who = this.props.fromMe ? 'me' : 'bot';

        const wrapperClassName = classList(
            'wc-message-wrapper',
            (this.props.activity as Message).attachmentLayout || 'list',
            this.props.onClickActivity && 'clickable'
        );

        const contentClassName = classList(
            'wc-message-content',
            this.props.selected && 'selected'
        );

        return (
            <div data-activity-id={ this.props.activity.id } className={ wrapperClassName } onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who } ref={ div => this.messageDiv = div }>
                    <div className={ contentClassName }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        { this.props.children }
                    </div>
                </div>
                <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
            </div>
        );
    }
}