// 发送一个初始 PV
var html = document.documentElement;
var UBT = require('./kernel');

exports.sendPv = function() {
  UBT.send('PV', {
    resolution: Math.max(html.clientWidth, window.innerWidth || 0) + 'x' + Math.max(html.clientHeight, window.innerHeight || 0),
    location: location.href.replace('/#/', '/'),
    referrer: document.referrer
  });
};
