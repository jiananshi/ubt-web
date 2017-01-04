
var configs = require('../configs');

exports.loadConfig = function(cb) {
  var req = new XMLHttpRequest();
  req.open('GET', configs.configUrl);
  req.onload = function() {
    cb(JSON.parse(req.responseText));
  };
  req.send();
};
