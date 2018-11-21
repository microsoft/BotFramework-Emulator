import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { navBar } from '../../../data/reducer/navBar';
import { mount } from 'enzyme';
import { PostMigrationDialogContainer } from './postMigrationDialogContainer';
import { PostMigrationDialog } from './postMigrationDialog';

jest.mock('../../dialogs', () => ({}));

describe('The PostMigrationDialogContainer component', () => {
    let wrapper;
    let node; 

    beforeEach(() => {
        wrapper = mount(
            <Provider store={ createStore(navBar)} >
                <PostMigrationDialogContainer />
            </Provider>);
        node = wrapper.find(PostMigrationDialog);
    });

    it('should render deeply', () => {
        expect(wrapper.find(PostMigrationDialogContainer)).not.toBe(null);
        expect(node.find(PostMigrationDialog)).not.toBe(null);
    });

    it('should contain a close function in the props', () => {
        expect(typeof (node.props() as any).close).toBe('function');
    });
});
