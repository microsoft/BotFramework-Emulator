import * as React from 'react';
import { css } from 'glamor';
import { Colors, Fonts } from '@bfemulator/ui-react';
import { Component } from 'react';

const HeaderCSS = css({
  fontSize: '11px',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  padding: '0px 20px',

  '& .knowledgebase-name': {
    fontWeight: 'bold',
    marginRight: '16px'
  }
});

interface QnAMakerHeaderState {
}

interface QnAMakerHeaderProps {
  knowledgeBaseName: string;
  knowledgeBaseId: String;
}

export default class QnAMakerHeader extends Component<QnAMakerHeaderProps, QnAMakerHeaderState> {
  constructor(props: QnAMakerHeaderProps, context: any) {
    super(props, context);
  }

  render() {
    return (
      <div {...HeaderCSS} className="qnamaker-header">
        <span className="knowledgebase-name">{this.props.knowledgeBaseName}</span>
        <span className="appid">Knowledgebase Id: {this.props.knowledgeBaseId}</span>
      </div>
    );
  }
}