import * as React from 'react';
import CommonDialog from './commonDialog';
import { Settings, addSettingsListener } from '../settings';
import { AddressBarActions } from '../reducers';
import { Emulator } from '../emulator'; 

export interface CustomEventDialogState {
    eventName: string,
    eventData: string
}

const defaultEventName = "CustomEventName";
const defaultEventData = "CustomEventData";

export class CustomEventDialog extends React.Component<{}, CustomEventDialogState> {
    showing?: boolean
    settingsUnsubscribe: any;

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            eventName: defaultEventName,
            eventData: defaultEventData,
        };
    }

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showCustomEventDialog != this.showing) {
                this.showing = settings.addressBar.showCustomEventDialog;
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    onAccept = () => {
        Emulator.customEvent({
            type: 'event',
            name: this.state.eventName,
            value: this.state.eventData
        });
        AddressBarActions.hideCustomEventDialog();
    }

    render() {
        if(!this.showing) {
            return null;
        }

        return (
            <CommonDialog      
                width={ 525 }
                height={ 487 }  
                className="customevent-dialog"
                onClose={ this.handleClose }
                onFocusLast={ () => {} }
                onFocusNatural={ () => {} }>

                <h2 className="dialog-header">Custom Event</h2>
                <div className='emu-dialog-text'>
                    Additional events can be sent by a modified Webchat client. These events can be then handled by your bot.
                </div>
                <div className="input-group">
                    <label className="form-label">
                        Name:
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="form-input customevent-name-input"
                        defaultValue={defaultEventName}
                        onChange={(elem) => this.setState({ eventName: elem.currentTarget.value })} />
                </div>
                <div className="input-group">
                    <label className="form-label">
                        Channel Data:
                    </label>
                    <textarea
                        name="channeldata"
                        className="form-input customevent-channeldata-input"
                        defaultValue={defaultEventData}
                        onChange={(elem) => this.setState({ eventData: elem.currentTarget.value })} />
                </div>
                <div className="dialog-buttons">
                    <button type="button" className="customevent-submitbtn" onClick={() => this.onAccept()}>
                        Submit
                    </button>
                    &nbsp;&nbsp;&nbsp;
                    <button type="button" className="customevent-cancelbtn" onClick={() => this.handleClose()}>
                        Cancel
                    </button>
                </div>
            </CommonDialog>
        )
    }

    handleClose() {
        AddressBarActions.hideCustomEventDialog();
    }
}