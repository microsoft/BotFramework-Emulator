import * as React from 'react';
import { Column, Row } from '@bfemulator/ui-react';
import { GenericDocument } from '../../layout';
import * as styles from './ngrokDebuggerContainer.scss';

export interface ngrokDebugConsoleProps {
  port: string;
  inspectUrl: string;
}

export const NgrokDebuggerContainer = props => {
  return (
    <GenericDocument className={styles.ngrokDebuggerContainer}>
      <Row>
        <Column className={styles.inputOutputStream}>
          <div>This container is me Number 1</div>
        </Column>
        <Column className={styles.tunnelHealth}>
          <div>This container is me Number 2</div>
        </Column>
      </Row>
    </GenericDocument>
  );
};
