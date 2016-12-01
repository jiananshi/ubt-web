var UBT = require('../kernel');
var on = require('../lib/on');
var parents = require('../lib/parents');
var collectDataFrom = require('../lib/collectdatafrom');

// 监控点击事件
var key = 'ubt-click';

var sendByElement = function(target) {
  UBT.send('EVENT', {
    id: target.getAttribute(key),
    params: collectDataFrom(target)
  });
};

on(document, 'click', function(event) {
  var element = event.target;
  // 如果点击的是一个包裹控件的 label 则不做任何处理，因为这种情况会动触发关联控件的 click 事件
  if (element.tagName === 'LABEL' && element.querySelector('input,textarea')) return;
  // 只要祖先级元素中存在 ubt-click 属性视为 ubt-click，于是允许嵌套
  parents(element, function(element) {
    if (element.hasAttribute(key)) sendByElement(element);
  });
});
