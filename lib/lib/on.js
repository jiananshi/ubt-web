// 兼容的事件绑定
module.exports = function(element, type, handler) {
  var wrapper = function(e) {
    e = e || event;
    var arg = { target: e.target || e.srcElement };
    handler.call(arg.target, arg);
  };
  if(element.addEventListener) {
    element.addEventListener(type, wrapper, true);
  } else if(element.attachEvent) {
    element.attachEvent('on' + type, wrapper);
  }
};

