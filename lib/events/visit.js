var UBT = require('../kernel');
var collectDataFrom = require('../lib/collectdatafrom');

var key = 'ubt-visit';
var visitKey = 'ubt-visit-key';

var stateSentPoints = {};

var performSend = function(id, element) {
  UBT.send('EVENT', {
    id: id,
    params: collectDataFrom(element)
  });
};

var visit = function(element) {
  var id = element.getAttribute(key);
  var aKey = element.getAttribute(visitKey) || ''; // a
  var pointPath = id + '/' + aKey;
  if (!stateSentPoints[pointPath]) {
    performSend(id, element); // sure, send real id, the key is local only
    stateSentPoints[pointPath] = true;
  }
  element.removeAttribute(key);
};

var isElementVisible = function(element) {
  var rect = element.getBoundingClientRect();
  var height = window.innerHeight || document.documentElement.clientHeight;
  var inWindow = height - rect.top > 0 && rect.bottom > 0;
  return (element.offsetWidth + element.offsetHeight && inWindow);
};

var watch = function() {
  var elements = document.querySelectorAll('[' + key + ']');
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (isElementVisible(element)) {
      visit(element);
    }
  };
  setTimeout(watch, 400);
};

watch();
