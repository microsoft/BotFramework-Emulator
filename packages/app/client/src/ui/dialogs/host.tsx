import * as React from 'react';
import { css } from 'glamor';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as Colors from '../styles/colors';
import { DialogService } from './service';

interface IDialogHostProps {
  saveHostRef?: (elem: HTMLElement) => void;
  showing?: boolean;
}

interface IDialogHostState {}

const CSS = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',

  '& .dialog-host-content': {
    height: 'auto',
    width: 'auto',
    maxWidth: '50%',
    maxHeight: '80%',
    overflow: 'auto',
    boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
  },

  '&.dialog-host-visible': {
    display: 'flex'
  }
});

class DialogHost extends React.Component<IDialogHostProps, IDialogHostState> {
  constructor(props, context) {
    super(props, context);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleContentClick = this.handleContentClick.bind(this);
    this.saveHostRef = this.saveHostRef.bind(this);
  }

  handleOverlayClick(e) {
    e.stopPropagation();
    DialogService.hideDialog();
  }

  handleContentClick(e) {
    // need to stop clicks inside the dialog from bubbling up to the overlay
    e.stopPropagation();
  }

  saveHostRef(elem) {
    DialogService.setHost(elem);
  }

  render() {
    const visibilityClass = this.props.showing ? ' dialog-host-visible' : '';

    return (
      <div className={ CSS + ' dialog-host-overlay' + visibilityClass } onClick={ this.handleOverlayClick }>
        <div className="dialog-host-content" onClick={ this.handleContentClick } ref={ this.saveHostRef }>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any): any {
  return ({ showing: state.dialog.showing });
}

export default connect(mapStateToProps, null)(DialogHost);
