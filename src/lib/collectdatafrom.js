import getRelatedValue from 'src/lib/getrelatedvalue';
import getRelatedMessage from 'src/lib/getrelatedmessage';

export default function(element) {

  // 获取两个固有参数
  var result = {
    value: getRelatedValue(element),
    message: getRelatedMessage(element)
  };

  // 从元素上获取 ubt-data-* 属性
  var attrs = element.attributes;
  var name, i;
  for(i = 0; i < attrs.length; i++) {
    if(/^ubt-data-(\w+)/.test(attrs[i])) {
      result[RegExp.$1] = element.getAttribute(RegExp.$1);
    }
  }
  
  return result;

};
