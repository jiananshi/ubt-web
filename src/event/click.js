import { UBT } from 'src/kernel';
import { on } from 'src/lib/on';
import { compress } from 'src/compress';
import { parents} from 'src/lib/parents';
import { getRelatedValue, getRelatedMessage } from 'src/getrelated';

// 监控点击事件
var key = 'ubt-click';

var sendByElement = function(target) {
  var name = target.getAttribute(key);
  var value = getRelatedValue(target);
  var message = getRelatedMessage(target);
  // 尽可能地获取点击目标相关信息
  UBT.send('EVENT', { name: name, action: 'click', message: compress(message), value: compress(value) });
};

on(document, 'click', function(event) {
  var element = event.target;
  // 如果点击的是一个包裹控件的 label 则不做任何处理，因为这种情况会动触发关联控件的 click 事件 
  if(element.tagName === 'LABEL' && element.querySelector('input,textarea')) return;
  // 只要祖先级元素中存在 ubt-click 属性视为 ubt-click，于是允许嵌套
  parents(element, function(element) {
    if(element.hasAttribute(key)) sendByElement(element);
  });
});

