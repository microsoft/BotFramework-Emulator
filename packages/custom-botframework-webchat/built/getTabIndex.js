"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IE_FOCUSABLE_LIST = ['a', 'body', 'button', 'frame', 'iframe', 'img', 'input', 'isindex', 'object', 'select', 'textarea'];
const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);
const IS_IE = /Trident\//i.test(navigator.userAgent);
function getTabIndex(element) {
    const { tabIndex } = element;
    if (IS_IE) {
        const tabIndexAttribute = element.attributes.getNamedItem('tabindex');
        if (!tabIndexAttribute || !tabIndexAttribute.specified) {
            return ~IE_FOCUSABLE_LIST.indexOf(element.nodeName.toLowerCase()) ? 0 : null;
        }
    }
    else if (!~tabIndex) {
        const attr = element.getAttribute('tabindex');
        if (attr === null || (attr === '' && !IS_FIREFOX)) {
            return null;
        }
    }
    return tabIndex;
}
exports.getTabIndex = getTabIndex;
;
//# sourceMappingURL=getTabIndex.js.map