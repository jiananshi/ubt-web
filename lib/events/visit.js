var UBT = require('../kernel');
var collectDataFrom = require('../lib/collectdatafrom');

var key = 'ubt-visit';

var sended = {};

var visit = function(element) {
  var id = element.getAttribute(key);
  if (!sended[id]) {
    UBT.send('EVENT', {
      id: id,
      params: collectDataFrom(element)
    });
    sended[id] = true;
  }
  element.removeAttribute(key);
};

var checkVisibility = function(element) {
  var rect = element.getBoundingClientRect();
  var height = window.innerHeight || document.documentElement.clientHeight;
  var inWindow = height - rect.top > 0 && rect.bottom > 0;
  if (element.offsetWidth + element.offsetHeight && inWindow) visit(element);
};

var watch = function() {
  var elements = document.querySelectorAll('[' + key + ']');
  for (var i = 0; i < elements.length; i++) checkVisibility(elements[i]);
  setTimeout(watch, 400);
};

watch();
