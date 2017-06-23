
var configs = require('../configs');

// throw an error that another analysing system could catch
var throwError = function(message) {
  setTimeout(function() {
    throw new Error(message);
  });
};

exports.loadConfig = function(cb) {
  var req = new XMLHttpRequest();
  req.open('GET', configs.configUrl);
  req.onreadystatechange = function(event) {
    if (req.readyState === 4) {
      if (req.status === 200) {
        try {
          cb(null, JSON.parse(req.responseText));
        } catch (error) {
          cb({req: req, msg: 'Failed to parse', error: error}, null);
          throwError('Failed to parse JSON: ' + req.responseText);
        }
      } else {
        cb({req: req, msg: 'Failed to load'}, null);
      }
    }
  };
  req.send();
};
