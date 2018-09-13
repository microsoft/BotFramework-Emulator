const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });
window.require = function () {
  return {
    ipcRenderer: {
      on() {
        return null;
      },
      send() {
        return null;
      }
    }
  };
};
window.define = function () {
  return null;
};

window.TextEncoder = class {
  encode() {
    return 'Hi! I am in your encode';
  }
};

window.TextDecoder = class {
  decode() {
    return 'Hi! I am in your decode';
  }
};

window.crypto = {
  subtle: {
    digest: async () => Promise.resolve('Hi! I am in your digest')
  }
};
