import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { ResourcesBarContainer } from './resourcesBarContainer';
import { ResourcesBar } from './resourcesBar';
import { ServiceType } from 'msbot/bin/schema';
import resources from '../../../../data/reducer/resourcesReducer';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';

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
  let mockDispatch;
  beforeEach(() => {
    mockChat = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceType.File,
      filePath: 'the/file/path/chat.chat',
      name: 'testChat'
    } as any);

    mockTranscript = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceType.File,
      filePath: 'the/file/path/transcript.transcript',
      name: 'testTranscript'
    } as any);

    parent = mount(<Provider store={ mockStore }>
      <ResourcesBarContainer/>
    </Provider>);
    node = parent.find(ResourcesBar);

    mockDispatch = jest.spyOn(mockStore, 'dispatch');
  });

  it('should render deeply', () => {
    expect(parent.find(ResourcesBarContainer)).not.toBe(null);
    expect(parent.find(ResourcesBar)).not.toBe(null);
  });
});
