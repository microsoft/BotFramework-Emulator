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

import * as React from 'react';
import { LinkButton, SmallHeader } from '@bfemulator/ui-react';

import * as styles from './welcomePage.scss';

export interface HowToBuildABotProps {
  onAnchorClick: (url: string) => void;
}

export class HowToBuildABot extends React.Component<HowToBuildABotProps, {}> {
  constructor(props: HowToBuildABotProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div className={styles.section}>
        <div className={styles.howToBuildSection}>
          <SmallHeader className={styles.howToTitle}>How to build a bot</SmallHeader>
          <div className={styles.stepContainer} role="presentation">
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan01} />
            </div>
            <div className={styles.stepSection}>
              <p className={styles.stepHeader}>Plan:</p>
              <p className={styles.stepContent} role="presentation">
                Review the bot&nbsp;
                <LinkButton
                  ariaLabel={'Learn more about design guidelines.'}
                  linkRole={true}
                  onClick={this.onDesignGuidelinesDocClick}
                >
                  design guidelines
                </LinkButton>{' '}
                for best practices&nbsp;
              </p>
            </div>
          </div>
          <div className={styles.stepContainer} role="presentation">
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan02} />
            </div>
            <div className={styles.stepSection}>
              <p className={styles.stepHeader}>Build:</p>
              <p className={styles.stepContent} role="presentation">
                <LinkButton linkRole={true} onClick={this.onEmulatorToolsLinkClick}>
                  Download Command Line tools
                </LinkButton>
                <br />
                Create a bot&nbsp;
                <LinkButton
                  ariaLabel="Create a bot from Azure"
                  linkRole={true}
                  onClick={this.onEmulatorCreateBotAzureLinkClick}
                >
                  from Azure
                </LinkButton>{' '}
                or&nbsp;
                <LinkButton
                  ariaLabel="Create a bot locally"
                  linkRole={true}
                  onClick={this.onEmulatorCreateBotLocallyLinkClick}
                >
                  locally
                </LinkButton>
                <br />
                Add services such as
                <br />
                <LinkButton
                  ariaLabel={'Learn more about Language Understanding (LUIS)'}
                  linkRole={true}
                  onClick={this.onLUISDocsClick}
                >
                  Language Understanding (LUIS)
                </LinkButton>
                ,&nbsp;
                <LinkButton ariaLabel={'Learn more about QnAMaker'} linkRole={true} onClick={this.onQnADocsLinkClick}>
                  QnAMaker
                </LinkButton>
                &nbsp;and&nbsp;
                <LinkButton ariaLabel={'Learn more about Dispatch'} linkRole={true} onClick={this.onDispatchLinkClick}>
                  Dispatch
                </LinkButton>
              </p>
            </div>
          </div>
          <div className={styles.stepContainer} role="presentation">
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan03} />
            </div>
            <div className={styles.stepSection}>
              <p className={`${styles.stepHeader} ${styles.testBullet}`}>Test:</p>
              <p className={styles.stepContent} role="presentation">
                Test with the&nbsp;
                <LinkButton
                  ariaLabel={'Test your bot on the Emulator.'}
                  linkRole={true}
                  onClick={this.onDebugWithEmulatorLinkClick}
                >
                  Emulator
                </LinkButton>{' '}
                <br />
                Test online in&nbsp;
                <LinkButton
                  ariaLabel={'Test online in Web Chat.'}
                  linkRole={true}
                  onClick={this.onDebugWithWebChatLinkClick}
                >
                  Web Chat
                </LinkButton>
              </p>
            </div>
          </div>
          <div className={styles.stepContainer} role="presentation">
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan04} />
            </div>
            <div className={styles.stepSection}>
              <p className={styles.stepHeader}>Publish:</p>
              <p className={styles.stepContent} role="presentation">
                Publish directly to Azure or
                <br />
                Use&nbsp;
                <LinkButton
                  ariaLabel={'Learn Continuous Deployment.'}
                  linkRole={true}
                  onClick={this.onContinuousDeploymentLinkClick}
                >
                  Continuous Deployment
                </LinkButton>
                &nbsp;
              </p>
            </div>
          </div>
          <div className={styles.stepContainer} role="presentation">
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan05} />
            </div>
            <div className={styles.stepSection}>
              <p className={styles.stepHeader}>Connect:</p>
              <p className={styles.stepContent} role="presentation">
                Connect to&nbsp;
                <LinkButton
                  ariaLabel={'Learn more connecting to channels.'}
                  linkRole={true}
                  onClick={this.onConnectChannelsLinkClick}
                >
                  channels
                </LinkButton>
                &nbsp;
              </p>
            </div>
          </div>
          <div className={styles.stepContainer} role="presentation">
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan06} />
            </div>
            <div className={styles.stepSection}>
              <p className={styles.stepHeader}>Evaluate:</p>
              <p className={styles.stepContent} role="presentation">
                <LinkButton linkRole={true} onClick={this.onAnalyticsLinkClick}>
                  View analytics
                </LinkButton>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onDesignGuidelinesDocClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-design-guidelines'
  );

  private onEmulatorCreateBotAzureLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-create-bot-azure'
  );

  private onEmulatorCreateBotLocallyLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-create-bot-locally'
  );

  private onEmulatorToolsLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-tools');

  private onLUISDocsClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-LUIS-docs-home');

  private onQnADocsLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-qna-docs-home');

  private onDispatchLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-create-dispatch');

  private onDebugWithEmulatorLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-debug-with-emulator'
  );

  private onDebugWithWebChatLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-debug-with-web-chat'
  );

  private onContinuousDeploymentLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-publish-continuous-deployment'
  );

  private onConnectChannelsLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-connect-channels'
  );

  private onAnalyticsLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-bot-analytics');
}
