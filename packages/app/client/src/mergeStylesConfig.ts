declare const DEV: boolean; // See webpack.config.js
(window as any).FabricConfig = {
  mergeStyles: {
    injectionMode: DEV ? 2 : 1,
    defaultPrefix: DEV ? 'where_is_waldo' : 'c'
  }
};
