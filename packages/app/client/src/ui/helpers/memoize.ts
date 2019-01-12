export default function memoize<T>(fn: (...args: any[]) => T) {
  let lastArgs: any[] = [];
  let result: T;

  return function(): T {
    if (
      lastArgs.length !== arguments.length ||
      lastArgs.some((arg, index) => arg !== arguments[index])
    ) {
      result = fn.apply(null, arguments);
      lastArgs = [].slice.call(arguments);
    }

    return result;
  };
}
