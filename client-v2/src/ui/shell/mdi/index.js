import React from 'react';
import { connect } from 'react-redux';
import EditorFactory from '../../editor';
import MultiTabs from '../multiTabs';
import TabFactory from './tabFactory';
import TabbedDocument, { Tab as TabbedDocumentTab, Content as TabbedDocumentContent } from '../multiTabs/tabbedDocument';

class MDI extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTabChange = this.handleTabChange.bind(this);

        this.state = { tabValue: 0 };
    }

    handleTabChange(tabValue) {
        this.setState(() => ({ tabValue }));
    }

    render() {
        return (
            <MultiTabs
                onChange={ this.handleTabChange }
                value={ this.state.tabValue }
            >
                {
                    Object.keys(this.props.documents).map(documentId =>
                        <TabbedDocument>
                            <TabbedDocumentTab>
                                <TabFactory documentId={ documentId } document={ this.props.documents[documentId] } />
                            </TabbedDocumentTab>
                            <TabbedDocumentContent>
                                <EditorFactory documentId={ documentId } document={ this.props.documents[documentId] } />
                            </TabbedDocumentContent>
                        </TabbedDocument>
                    )
                }
            </MultiTabs>
        );
    }
}

export default connect(state => ({ documents: state.cards }))(MDI)
