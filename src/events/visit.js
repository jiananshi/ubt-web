import UBT from 'src/kernel';
import compress from 'src/lib/compress';
import getRelatedValue from 'src/lib/getrelatedvalue';
import getRelatedMessage from 'src/lib/getrelatedmessage';

var visit = function(element) {
  var name = element.getAttribute('ubt-visit');
  var value = getRelatedValue(element);
  var message = getRelatedMessage(element);
  UBT.send('EVENT', { name: name, action: 'visit', message: compress(message), value: compress(value) });
  element.removeAttribute('ubt-visit');
}

var checkVisibility = function(element) {
  if(element.offsetWidth + element.offsetHeight) visit(element);
};

var watch = function() {
  var elements = document.querySelectorAll('[ubt-visit]');
  for(var i = 0; i < elements.length; i++) checkVisibility(elements[i]);
  setTimeout(watch, 1000);
};

watch();
