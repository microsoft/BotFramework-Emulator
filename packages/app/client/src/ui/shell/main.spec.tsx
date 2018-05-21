window['require'] = function(){
  return {
    ipcRenderer: {
      on() {},
      send() {}
    }
  }
};
window['define'] = function() {}
import * as React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Main } from './main';

describe('The Main component should', () => {

  it('should pass an empty test', () => {
    const parent = shallow(<Main/>);
    expect(parent.find(Main)).not.toBe(null)
  });

});
