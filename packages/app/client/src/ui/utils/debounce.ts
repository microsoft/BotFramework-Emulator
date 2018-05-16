export const debounce = function (closure: (args?: any[]) => any, timeout: number = 500) {
  let lastTick = Date.now();
  return function (...args) {
    if (Date.now() - lastTick > timeout) {
      lastTick = Date.now();
      return closure(...args);
    }
  }
};
