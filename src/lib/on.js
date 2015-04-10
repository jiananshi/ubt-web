// 兼容的事件绑定
export var on = function(element, type, handler) {
  var wrapper = function(e) {
    e = e || event;
    e.target = e.target || e.srcElement;
    handler.call(e.target, e);
  };
  if(element.addEventListener) {
    element.addEventListener(type, wrapper, true);
  } else if(element.attachEvent) {
    element.attachEvent('on' + type, wrapper);
  }
};

