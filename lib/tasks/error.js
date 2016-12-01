var UBT = require('../kernel');

// 用于缓存已经发送过的错误信息
var errorCache = {};

// 为了防止无限发，这里限制只发送 10 次
var limit = 10;
var sendMessage = function(message) {
  if (!message || errorCache[message] || limit <= 0) return;
  UBT.send('JSERROR', { message: message });
  errorCache[message] = true;
  limit--;
};

if (window.addEventListener) {
  addEventListener('error', function(e) {
    sendMessage(e.error && e.error.stack);
  });
} else if (window.attachEvent) {
  window.attachEvent('onerror', function(msg, url, line) {
    sendMessage([msg, 'url: ' + url, 'line: ' + line].join('\r\n'));
  });
}

