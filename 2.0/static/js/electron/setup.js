/* eslint-disable no-console */
/**
 * Core UI functions are initialized in this file. This prevents
 * unexpected errors from breaking the core features. Specifically,
 * actions in this file should not require the usage of any internal
 * modules, excluding dependencies.
 */
const {ipcRenderer, remote, shell, webFrame} = require('electron') // eslint-disable-line

// Log deprecation and process warnings.
process.traceProcessWarnings = true;
process.traceDeprecation = true;

// Display warning when devtools window is opened.
remote.getCurrentWebContents().on('devtools-opened', () => {
  console.log('%cThe console is dark and full of terrors.', 'color: white; -webkit-text-stroke: 4px #a02d2a; font-size: 60px; font-weight: bold');
  console.log('%cIf you\'ve been told to paste something here, you\'re being scammed.', 'font-size: 16px');
  console.log('%cUnless you know exactly what you\'re doing, close this window.', 'font-size: 16px');
});

// Disable zoom, needed for darwin.
webFrame.setZoomLevel(0);
webFrame.setVisualZoomLevelLimits(1, 1);
