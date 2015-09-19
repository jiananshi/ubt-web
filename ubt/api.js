var UBT = require('../lib/entry.js');
var XCeptor = require('xceptor');

UBT.TIMEOUT = 5000;

XCeptor.when(/(?=)/, /(?=)/, function(req, res) {
  req.customData = {
    beginstamp: new Date(),
    timer: setTimeout(function() {
      UBT.send('APITIMEOUT', { url: req.url, timeout: UBT.TIMEOUT });
    }, UBT.TIMEOUT)
  }
}, function(req, res) {
  clearTimeout(req.customData.timer);
  if(res.status >= 500) {
    setTimeout(function() {
      UBT.send('SERVERERROR', {
        status: res.status,
        url: req.url,
        duration: new Date() - req.customData.beginstamp
      });
    });
  }
});
