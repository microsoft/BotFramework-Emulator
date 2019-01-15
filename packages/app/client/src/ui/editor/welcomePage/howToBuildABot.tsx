import * as React from 'react';
import * as styles from './welcomePage.scss';

export function HowToBuildABot() {
  return (
    <div className={ styles.section }>
      <div className={ styles.howToBuildSection }>
        <h3>How to build a bot</h3>
        <div className={ styles.stepContainer }>
          <div className={ styles.stepIcon }>
            <div className={ styles.buildPlan01 }/>
          </div>
          <dl>
            <dt>Plan:</dt>
            <dd>
              Review the bot&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-design-guidelines">
                design guidelines
              </a> for best practices&nbsp;
            </dd>
          </dl>
        </div>
        <div className={ styles.stepContainer }>
          <div className={ styles.stepIcon }>
            <div className={ styles.buildPlan02 }/>
          </div>
          <dl>
            <dt>Build:</dt>
            <dd>
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-tools">
                Download Command Line tools
              </a><br/>
              Create a bot&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-create-bot-azure">
                from Azure
              </a> or&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-create-bot-locally">
                locally
              </a><br/>
              Add services such as<br/>
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-LUIS-docs-home">
                Language Understanding (LUIS)
              </a>,&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-qna-docs-home">QnAMaker</a>
              &nbsp;and&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-create-dispatch">
                Dispatch
              </a>
            </dd>
          </dl>
        </div>
        <div className={ styles.stepContainer }>
          <div className={ styles.stepIcon }>
            <div className={ styles.buildPlan03 }/>
          </div>
          <dl>
            <dt className={ styles.testBullet }>Test:</dt>
            <dd>
              Test with the&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-debug-with-emulator">
                Emulator
              </a> <br/>
              Test online in&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-debug-with-web-chat">
                Web Chat
              </a></dd>
          </dl>
        </div>
        <div className={ styles.stepContainer }>
          <div className={ styles.stepIcon }>
            <div className={ styles.buildPlan04 }/>
          </div>
          <dl>
            <dt>Publish:</dt>
            <dd>
              Publish directly to Azure or<br/>
              Use
              <a className={ styles.ctaLink }
                 href="https://aka.ms/bot-framework-emulator-publish-continuous-deployment"
              >&nbsp;
                Continuous Deployment
              </a>
              &nbsp;
            </dd>
          </dl>
        </div>
        <div className={ styles.stepContainer }>
          <div className={ styles.stepIcon }>
            <div className={ styles.buildPlan05 }/>
          </div>
          <dl>
            <dt>Connect:</dt>
            <dd>
              Connect to&nbsp;
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-connect-channels">
                channels
              </a>
              &nbsp;
            </dd>
          </dl>
        </div>
        <div className={ styles.stepContainer }>
          <div className={ styles.stepIcon }>
            <div className={ styles.buildPlan06 }/>
          </div>
          <dl>
            <dt>Evaluate:</dt>
            <dd>
              <a className={ styles.ctaLink } href="https://aka.ms/bot-framework-emulator-bot-analytics">
                View analytics
              </a>
            </dd>
          </dl>
        </div>
      </div>
    </div> );
}
