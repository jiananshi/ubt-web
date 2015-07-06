import UBT from 'src/kernel';
import collectDataFrom from 'src/lib/collectdatafrom';

var key = 'ubt-visit';

var visit = function(element) {
  UBT.send('EVENT', {
    id: element.getAttribute(key),
    params: collectDataFrom(element)
  });
};

var checkVisibility = function(element) {
  if(element.offsetWidth + element.offsetHeight) visit(element);
};

var watch = function() {
  var elements = document.querySelectorAll('[ubt-visit]');
  for(var i = 0; i < elements.length; i++) checkVisibility(elements[i]);
  setTimeout(watch, 1000);
};

watch();
