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
import { TunnelCheckTimeInterval, TunnelStatus } from '@bfemulator/app-shared';

import * as styles from './ngrokStatusIndicator.scss';

export interface NgrokTimeIntervalIndicatorProps {
  timeIntervalSinceLastPing: TunnelCheckTimeInterval;
  tunnelStatus: TunnelStatus;
  header: string;
}

export const NgrokStatusIndicator = (props: NgrokTimeIntervalIndicatorProps) => {
  const [statusDisplay, setStatusDisplay] = useState(styles.tunnelInactive);
  const [displayTimeInterval, setTimeIntervalDisplay] = useState('Last refreshed now');

  useEffect(() => {
    switch (props.tunnelStatus) {
      case TunnelStatus.Active:
        setStatusDisplay(styles.tunnelActive);
        break;

      case TunnelStatus.Error:
        setStatusDisplay(styles.tunnelError);
        break;

      default:
        setStatusDisplay(styles.tunnelInactive);
        break;
    }
  }, [props.tunnelStatus]);

  useEffect(() => {
    if (props.tunnelStatus === TunnelStatus.Inactive) {
      setTimeIntervalDisplay('');
      return;
    }
    switch (props.timeIntervalSinceLastPing) {
      case TunnelCheckTimeInterval.FirstInterval:
        setTimeIntervalDisplay('Refreshed 20 seconds ago...');
        break;

      case TunnelCheckTimeInterval.SecondInterval:
        setTimeIntervalDisplay('Refreshed 40 seconds ago...');
        break;

      default:
        setTimeIntervalDisplay('Refreshed now...');
        break;
    }
  }, [props.timeIntervalSinceLastPing]);

  return (
    <div className={styles.ngrokStatusIndicator}>
      <span className={styles.header}>{props.header}:</span>
      <span className={[styles.tunnelHealthIndicator, statusDisplay].join(' ')}>
        <span>{displayTimeInterval}</span>
      </span>
    </div>
  );
};
