var Image = function() {
  var div = document.createElement('div');
  Object.defineProperty(div, 'src', {
    set: function(src) {
      var data = JSON.parse(decodeURIComponent(src.split('?')[1]));
      if(typeof onsend === 'function') onsend(data);
    }
  });
  return div;
};

