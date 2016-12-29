
var uuid = require('./uuid');

exports.createSsid = function() {
  // 创建一个北京时间的日期字符串作为 ssid 的结尾（TODO: 客户端时间可能是不准确的）
  var t = new Date(new Date().getTime() + 480 * 60000);
  var ssid = uuid() + '_' + [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()].join('-').replace(/\b\d\b/g, '0$&');
  return ssid;
};

exports.createCookie = function(ssid, domain) {
  return 'ubt_ssid=' + ssid + '; Expires=Wed, 31 Dec 2098 16:00:00 GMT; Domain=' + domain + '; Path=/';
};

exports.packEvents = function(eventList) {
  var pvhash = eventList[0].pvhash;
  var ssid = eventList[0].ssid;
  var shortEvents = eventList.map(function(singleEvent) {
    var base = {};
    for (var key in singleEvent) {
      if (['pvhash', 'ssid'].indexOf(key) < 0) {
        base[key] = singleEvent[key];
      }
    }
    return base;
  });
  return {
    data: shortEvents,
    pvhash: pvhash,
    referer: location.href,
    ssid: ssid
  };
};
