import UBT from 'src/kernel';
import collectDataFrom from 'src/lib/collectdatafrom';

var key = 'ubt-visit';

var sended = {};

var visit = function(element) {
  var id = element.getAttribute(key);
  if(!sended[id]) {
    UBT.send('EVENT', {
      id: id,
      params: collectDataFrom(element)
    });
    sended[id] = true;
  }
  element.removeAttribute(key);
};

var checkVisibility = function(element) {
  if(element.offsetWidth + element.offsetHeight) visit(element);
};

var watch = function() {
  var elements = document.querySelectorAll('[' + key + ']');
  for(var i = 0; i < elements.length; i++) checkVisibility(elements[i]);
  setTimeout(watch, 800);
};

watch();
