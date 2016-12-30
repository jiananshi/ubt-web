
var configs = require('../configs');
var packEvents = require('./index').packEvents;

// // for debugging purpose
// var log = function() {
//   console.debug.apply(console, arguments);
// };

// some states of the batching worker

var stateEventQueue = []; // buffer for events
var stateWorkers = 0; // how many requests are during sending
var timeoutRef; // cancelable setTimeout

// will be overwriten by network results
var crayfishConfigs = configs.crayfish;

var performSendMessage = function(message, cb) {
  if (window.UBT_DEBUG_BATCH != null) {
    stateWorkers += 1;
    window.UBT_DEBUG_BATCH(message);
    setTimeout(function() {
      stateWorkers -= 1;
      // log('Mocked network end');
      cb(null);
    }, Math.random() * crayfishConfigs.timeout);
    return;
  }
  var req = new XMLHttpRequest();
  req.open('POST', configs.trackerUrl);
  req.withCredentials = true;
  req.setRequestHeader('Content-type', 'application/json');
  req.timeout = crayfishConfigs.timeout;
  req.onload = function() {
    stateWorkers -= 1;
    // log('Real network end');
    cb(req);
  };
  stateWorkers += 1;
  req.send(JSON.stringify(message));
};

// this is a state machine, be careful editing this, hard to test
var remindSendingMessage = function() {
  // log('Remind,', 'queue size:', stateEventQueue.length, 'workers:', stateWorkers, 'delayed task:', timeoutRef);

  if (stateWorkers >= crayfishConfigs.concurrency) {
    // log('Step 1: give up sending if there is enough workers');
    return;
  }
  if (stateEventQueue.length === 0) {
    // log('Step 2: if queue is empty, just leave');
    return;
  }
  if (stateEventQueue.length < crayfishConfigs.queueSize) {
    // log('Step 3: if there are too few events queued, give up sending');
    if (timeoutRef == null) {
      // log('Create a delayed task, when there is not one');
      timeoutRef = setTimeout(function() {
        performSendMessage(packEvents(stateEventQueue), function(req) {
          remindSendingMessage();
        });
        stateEventQueue = [];
        timeoutRef = undefined;
        // log('Finished delayed task');
      }, crayfishConfigs.interval);
    }
    return;
  }
  // log('Step 4: now queue is full, force sending it and cancel the delayed task');
  if (timeoutRef != null) {
    clearTimeout(timeoutRef);
    timeoutRef = undefined;
    // log('Force removing existing delayed task');
  }
  performSendMessage(packEvents(stateEventQueue), function(req) {
    remindSendingMessage();
  });
  stateEventQueue = [];
};

// if page is closed with unsent events, store them in localStorage
// and send it when the next time page is opened

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
      performSendMessage(leftMessage, function() {
        // nothing to to
      });
      localStorage.removeItem(configs.dehydratedKey);
    }
  } catch (error) {
    // console.error(error);
  }
};

// expose methods

exports.startSendingLoop = function(configs) {
  // overwrite default configs
  crayfishConfigs = configs;

  checkDehydratedMessage();
  window.addEventListener('beforeunload', handlePageClose);
};

exports.trackEvent = function(event) {
  stateEventQueue.push(event);
  remindSendingMessage();
};
