
var configs = require('../configs');

var stateEventQueue = [];

var packEvents = function(eventList) {
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

var performSendMessage = function(message) {
  // TODO, send message here with XHR with some timeout
  console.log('Should send:', message);
};

var performSendEvents = function() {
  if (stateEventQueue.length > 0) {
    var message = packEvents(stateEventQueue);
    performSendMessage(message);
  }
  stateEventQueue = [];
};

var performSaveEvents = function() {
  var leftMessage = packEvents(stateEventQueue);
  localStorage.setItem(configs.dehydratedKey, JSON.stringify(leftMessage));
};

var handlePageClose = function() {
  if (stateEventQueue.length > 0) {
    performSaveEvents();
  } else {
    localStorage.removeItem(configs.dehydratedKey);
  }
};

var checkDehydratedMessage = function() {
  try {
    var leftPiece = localStorage.getItem(configs.dehydratedKey);
    if (typeof leftPiece === 'string' && leftPiece.length > 0) {
      var leftMessage = JSON.parse(leftPiece);
      performSendMessage(leftMessage);
      localStorage.removeItem(configs.dehydratedKey);
    }
  } catch (error) {
    // console.error(error);
  }
};

var tryCheckLength = function() {
  if (stateEventQueue.length > 10) {
    performSendEvents();
  }
};

exports.startSendingLoop = function() {
  checkDehydratedMessage();
  setInterval(performSendEvents, configs.sendingDuration);
  window.addEventListener('beforeunload', handlePageClose);
};

exports.trackEvent = function(event) {
  stateEventQueue.push(event);
  tryCheckLength();
};
