import React from 'react';
import { connect } from 'react-redux';
<<<<<<< HEAD
=======

import * as constants from '../../../constants';
import * as EditorActions from '../../../data/action/editorActions';
>>>>>>> 8eece5dd61a1660ca48287ea111108ede83faad7
import EditorFactory from '../../editor';
import MultiTabs from '../multiTabs';
import TabFactory from './tabFactory';
import TabbedDocument, { Tab as TabbedDocumentTab, Content as TabbedDocumentContent } from '../multiTabs/tabbedDocument';

class MDI extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTabChange = this.handleTabChange.bind(this);
    }

    handleTabChange(tabValue) {
        this.props.dispatch(EditorActions.setActive(this.props.documents[tabValue].documentId));
    }

    render() {
        const activeIndex = this.props.documents.findIndex(document => document.documentId === this.props.activeDocumentId);

        return (
            <MultiTabs
                onChange={ this.handleTabChange }
                value={ ~activeIndex ? activeIndex : 0 }
            >
                {
                    this.props.documents.map(document =>
                        <TabbedDocument key={ document.documentId }>
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

export default connect(state => ({
    activeDocumentId: state.editor.activeDocumentId,
    documents: state.editor.documents
}))(MDI)
