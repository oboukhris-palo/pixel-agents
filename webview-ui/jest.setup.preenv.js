/**
 * Jest pre-environment setup (runs via setupFiles, before module imports).
 * Defines VS Code WebView global so modules that call acquireVsCodeApi()
 * at module load time work in jsdom environment.
 */
global.acquireVsCodeApi = function () {
  return {
    postMessage: function () {},
    getState: function () { return undefined; },
    setState: function () {},
  };
};
