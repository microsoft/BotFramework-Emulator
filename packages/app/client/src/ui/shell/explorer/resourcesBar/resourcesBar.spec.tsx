import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { ResourcesBarContainer } from './resourcesBarContainer';
import { ResourcesBar } from './resourcesBar';
import { ServiceTypes } from 'botframework-config/lib/schema';
import resources from '../../../../data/reducer/resourcesReducer';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { chatFilesUpdated, transcriptsUpdated } from '../../../../data/action/resourcesAction';

const mockStore = createStore(combineReducers({ resources }), {});

jest.mock('./resourcesBar.scss', () => ({}));
jest.mock('../explorerStyles.scss', () => ({}));
jest.mock('../servicePane/servicePane.scss', () => ({}));
jest.mock('../resourceExplorer/resourceExplorer.scss', () => ({}));
describe('The ServicesExplorer component should', () => {
  let parent;
  let node;
  let mockChat;
  let mockTranscript;
  beforeEach(() => {
    mockChat = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: 'the/file/path/chat.chat',
      name: 'testChat'
    } as any);

    mockTranscript = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: 'the/file/path/transcript.transcript',
      name: 'testTranscript'
    } as any);

    mockStore.dispatch(transcriptsUpdated([mockTranscript]));
    mockStore.dispatch(chatFilesUpdated([mockChat]));

    parent = mount(<Provider store={ mockStore }>
      <ResourcesBarContainer/>
    </Provider>);
    node = parent.find(ResourcesBar);
  });

  it('should render deeply', () => {
    expect(parent.find(ResourcesBarContainer)).not.toBe(null);
    expect(node).not.toBe(null);
  });
});
