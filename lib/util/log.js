
var configs = require('../configs');

exports.log = function() {
  if (configs.verbose) {
    console.debug.apply(console, arguments);
  }
};
