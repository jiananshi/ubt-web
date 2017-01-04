// 兼容的事件绑定
module.exports = function(element, type, handler) {
  var wrapper = function(e) {
    e = e || event;
    var arg = { target: e.target || e.srcElement };
    // 在 SVG 1.1 中, <use>的监听器里 event.target 是 SVGElementInstance
    // 它的 correspondingUseElement 才是元素
    if (arg.target.correspondingUseElement) {
      arg.target = arg.target.correspondingUseElement;
    }
    handler.call(arg.target, arg);
  };
  if (element.addEventListener) {
    element.addEventListener(type, wrapper, true);
  } else if (element.attachEvent) {
    element.attachEvent('on' + type, wrapper);
  }
};

