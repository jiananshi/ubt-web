
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
  req.setRequestHeader('Content-Type', 'application/json');
  req.timeout = crayfishConfigs.timeout;
  // onload has concerns in old browsers
  // http://stackoverflow.com/a/9181508/883571
  var stateRequestEnd = false;
  var endRequest = function() {
    if (!stateRequestEnd) {
      stateRequestEnd = true;
      stateWorkers -= 1;
      cb(req);
    }
  };
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      // log('Real network end');
      // Loaded, including statusCode 0
      endRequest();
    }
  };
  req.ontimeout = function() {
    endRequest();
  };
  req.onerror = function() {
    // Exception
    endRequest();
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
        persistQueueInStorage();
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
  persistQueueInStorage();
};

// if page is closed with unsent events, store them in localStorage
// and send it when the next time page is opened

var dehydrateEvents = function() {
  var leftMessage = packEvents(stateEventQueue);
  try {
    // in case another page already wrote messages, try to concat them
    var leftPiece = localStorage.getItem(configs.dehydratedKey);
    if (typeof leftPiece === 'string') {
      var existingMessages = JSON.parse(leftPiece);
      // modify existing piece
      existingMessages.push(leftMessage);
      localStorage.setItem(configs.dehydratedKey, JSON.stringify(existingMessages));
    } else {
      localStorage.setItem(configs.dehydratedKey, JSON.stringify([leftMessage]));
    }
  } catch (error) {}
};

var persistQueueInStorage = function() {
  if (stateEventQueue.length > 0) {
    dehydrateEvents();
  } else {
    try {
      localStorage.removeItem(configs.dehydratedKey);
    } catch (error) {}
  }
};

var checkDehydratedMessage = function() {
  try {
    var leftPiece = localStorage.getItem(configs.dehydratedKey);
    if (typeof leftPiece === 'string') {
      // throws error if JSON is malformed
      var existingMessages = JSON.parse(leftPiece);
      // unlikely to have more than one messages
      // old browsers, deprecate forEach
      for (var i = 0; i < existingMessages.length; i++) {
        performSendMessage(existingMessages[i], function() {
          // nothing to to
        });
      }
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
};

exports.trackEvent = function(event) {
  stateEventQueue.push(event);
  persistQueueInStorage();
  remindSendingMessage();
};
