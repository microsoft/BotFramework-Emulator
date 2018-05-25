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
