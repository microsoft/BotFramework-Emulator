//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import React, { useEffect, useState } from 'react';
import { TunnelStatus } from '@bfemulator/app-shared';

import * as styles from './ngrokTab.scss';
import { Tab, TabProps } from './tab';

export interface NgrokTabProps extends TabProps {
  tunnelStatus: TunnelStatus;
}

export const NgrokTab = (props: NgrokTabProps) => {
  const [status, setStatus] = useState({
    className: styles.tunnelInactive,
    ariaLabel: 'Tunnel Active',
  });

  const [preventAddingBlinker, preventAddingBlinkerAfterActive] = useState(false);

  useEffect(() => {
    if (props.active && !preventAddingBlinker) {
      preventAddingBlinkerAfterActive(true);
    }
  }, [props.active]);

  useEffect(() => {
    switch (props.tunnelStatus) {
      case TunnelStatus.Active:
        setStatus({
          className: styles.tunnelActive,
          ariaLabel: 'Tunnel Active',
        });
        break;

      case TunnelStatus.Error:
        setStatus({
          className: styles.tunnelError,
          ariaLabel: 'Tunnel Error',
        });
        break;

      default:
        setStatus({
          className: styles.tunnelInactive,
          ariaLabel: 'Tunnel Inactive',
        });
        break;
    }
  }, [props.tunnelStatus]);

  const blinkerErrorClass = preventAddingBlinker ? '' : styles.blinkerError;
  return (
    <div className={[styles.ngrokTab, status.className, blinkerErrorClass].join(' ')}>
      <Tab
        active={props.active}
        dirty={props.dirty}
        documentId={props.documentId}
        index={props.index}
        label={props.label}
        onCloseClick={props.onCloseClick}
        hideIcon={true}
      >
        <div className={styles.statusIndicator} aria-label={status.ariaLabel} />
      </Tab>
    </div>
  );
};
