
var configs = require('../configs');
var packEvents = require('./index').packEvents;
var UbtStorage = require('./storage');

// // for debugging purpose
// var log = function() {
//   console.debug.apply(console, arguments);
// };

// some states of the batching worker

var stateEventQueue = new UbtStorage(configs.dehydratedKey); // buffer for events
// if data already exists, use the data
stateEventQueue.prepare([]);

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
  var eventQueue = stateEventQueue.get();
  // log('Remind,', 'queue size:', eventQueue.length, 'workers:', stateWorkers, 'delayed task:', timeoutRef);

  if (stateWorkers >= crayfishConfigs.concurrency) {
    // log('Step 1: give up sending if there is enough workers');
    return;
  }
  if (eventQueue.length === 0) {
    // log('Step 2: if queue is empty, just leave');
    return;
  }
  if (eventQueue.length < crayfishConfigs.queueSize) {
    // log('Step 3: if there are too few events queued, give up sending');
    if (timeoutRef == null) {
      // log('Create a delayed task, when there is not one');
      timeoutRef = setTimeout(function() {
        // do check, another thread might have sent and cleared messages
        var currentEventQueue = stateEventQueue.get();
        if (currentEventQueue.length > 0) {
          performSendMessage(packEvents(currentEventQueue), function(req) {
            remindSendingMessage();
          });
          stateEventQueue.reset([]);
        }
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
  performSendMessage(packEvents(eventQueue), function(req) {
    remindSendingMessage();
  });
  stateEventQueue.reset([]);
};

var checkDehydratedMessage = function() {
  var eventQueue = stateEventQueue.get();
  // unlikely to have more than one messages
  // old browsers, deprecate forEach
  if (eventQueue.length > 0) {
    performSendMessage(packEvents(eventQueue), function() {
      // nothing to to
    });
    stateEventQueue.reset([]);
  }
};

// expose methods

exports.startSendingLoop = function(configs) {
  // overwrite default configs
  crayfishConfigs = configs;

  checkDehydratedMessage();
};

exports.trackEvent = function(event) {
  stateEventQueue.append(event);
  remindSendingMessage();
};
