// eslint-disable-next-line no-global-assign
require = require('esm')(module);

const AssetExec = require('./assetExec.js').default;

// eslint-disable-next-line no-new
new AssetExec(process.argv.splice(2));
