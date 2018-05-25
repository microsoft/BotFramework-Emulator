export const debounce = function (closure: (args?: any) => any, timeout: number = 500) {
  let lastTick = 0;
  return function (...args: any[]) {
    if (Date.now() - lastTick > timeout) {
      lastTick = Date.now();
      return closure(...args);
    }
  };
};
