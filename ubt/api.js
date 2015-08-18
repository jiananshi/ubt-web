var UBT = require('../lib/entry.js');
var XCeptor = require('exports?XCeptor!../bower_components/xceptor/xceptor.js');

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
  if(res.status / 100 | 0 === 5) {
    setTimeout(function() {
      UBT.send('SERVERERROR', {
        status: res.status,
        url: req.url,
        duration: new Date() - req.customData.beginstamp
      });
    });
  }
});
