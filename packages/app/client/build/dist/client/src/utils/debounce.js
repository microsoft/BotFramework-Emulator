export const debounce = function (closure, timeout = 500) {
    let lastTick = 0;
    return function (...args) {
        if (Date.now() - lastTick > timeout) {
            lastTick = Date.now();
            return closure(...args);
        }
    };
};
//# sourceMappingURL=debounce.js.map