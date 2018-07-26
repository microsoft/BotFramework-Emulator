export default function memoize(fn) {
    let lastArgs = [];
    let result;
    return function () {
        if (lastArgs.length !== arguments.length
            || lastArgs.some((arg, index) => arg !== arguments[index])) {
            result = fn.apply(null, arguments);
            lastArgs = [].slice.call(arguments);
        }
        return result;
    };
}
//# sourceMappingURL=memoize.js.map