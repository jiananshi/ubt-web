
var configs = require('../configs');

exports.loadConfig = function(cb) {
  var req = new XMLHttpRequest();
  req.open('GET', configs.configUrl);
  req.onreadystatechange = function(event) {
    if (req.readyState === 4) {
      if (req.status === 200) {
        cb(null, JSON.parse(req.responseText));
      } else {
        cb({req: req, msg: 'failed'}, null);
        // throw an error that another analysing system could catch
        setTimeout(function() {
          throw new Error('Failed to load UBT config with code: ' + req.status);
        });
      }
    }
  };
  req.send();
};
