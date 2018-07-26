import * as React from 'react';
import { shallow } from 'enzyme';
import { Main } from './main';
describe('The Main component should', () => {
    it('should pass an empty test', () => {
        const parent = shallow(React.createElement(Main, null));
        expect(parent.find(Main)).not.toBe(null);
    });
});
//# sourceMappingURL=main.spec.js.map