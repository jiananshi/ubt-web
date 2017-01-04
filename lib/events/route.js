var UBT = require('../kernel');
var on = require('../util/on');

// 对事件进行管理, 连续操作提交最后一次
var minimalTimeToRead = 200;
var currentDelayedEvent = null;

var scheduleRouteEvent = function() {
  if (currentDelayedEvent !== null) {
    clearTimeout(currentDelayedEvent);
  }
  currentDelayedEvent = setTimeout(function() {
    // routeChange 定义在后面
    routeChange();
    currentDelayedEvent = null;
  }, minimalTimeToRead);
};

// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
var isHistorySupported = (window.history && 'pushState' in window.history);

var stateLastReferrer = document.referrer;

var routeChange = function() {
  var html = document.documentElement;
  var w = Math.max(html.clientWidth, window.innerWidth || 0);
  var h = Math.max(html.clientHeight, window.innerHeight || 0);
  UBT.send('PV', {
    resolution: w + 'x' + h,
    location: location.href,
    referrer: stateLastReferrer
  });
  stateLastReferrer = location.href;
};

// 如果支持 pushState, 也计入事件
// http://stackoverflow.com/a/4585031/883571
if (isHistorySupported) {
  var pushState = history.pushState;
  history.pushState = function(state) {
    scheduleRouteEvent();
    return pushState.apply(history, arguments);
  };
}

on(window, 'popstate', function(event) {
  scheduleRouteEvent();
});

on(window, 'hashchange', function(event) {
  scheduleRouteEvent();
});
