import { mount } from 'enzyme';
import * as React from 'react';
import { KvPair } from './kvPair';

jest.mock('./connectedServiceEditor.scss', () => ({}));
describe('The KvPair component', () => {
  let node;
  let mockKvs;
  const mockOnChange = {
    onKvPairChanged: () => null
  };

  beforeEach(() => {
    mockKvs = {
      someKey: 'someValue'
    };

    node = mount(<KvPair onChange={ mockOnChange.onKvPairChanged } kvPairs={ mockKvs }/>);
  });

  it('should render at least one empty row when at least one non-empty row exist in the data', () => {
    const instance = node.instance();
    expect(instance.render().props.children.length).toBe(3);
  });

  it('should increment state.length when "onAddKvPairClick()" is called', () => {
    const instance = node.instance();
    const { length } = node.state();
    instance.onAddKvPairClick();
    expect(node.state().length).toBe(length + 1);
  });

  it('should call the given callback with the updated kv pairs when "onChange()" is called', () => {
    const input = node.find('ul li:last-child input[data-prop="key"]');
    const instance = input.instance();
    instance.value = 'someKey2';

    node.instance().onChange({ target: instance });
    expect(node.state()).toEqual({
      'kvPairs': [
        {
          key: 'someKey',
          value: undefined
        },
        {
          key: 'someKey2',
          value: ''
        }
      ], length: 2
    });
  });
});
