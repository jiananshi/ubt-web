var getRelatedValue = require('./get-related-value');
var getRelatedMessage = require('./get-related-message');
var util = require('./index');

module.exports = function(element) {

  // 获取两个固有参数
  var result = {
    value: getRelatedValue(element),
    message: getRelatedMessage(element)
  };

  // 从元素上获取 ubt-data-* 属性
  var attrs = element.attributes;

  var baseData = {};
  if (attrs['ubt-data'] != null) {
    try {
      var ubtData = JSON.parse(attrs['ubt-data'].value);
      if (ubtData instanceof Object) {
        if (ubtData instanceof Array) {
          console.warn('[UBT] ubt-data should be object, got array:', ubtData);
        } else {
          baseData = ubtData;
        }
      }
    } catch (error) {
      // expose error to error listeners
      setTimeout(function() {
        throw error;
      }, 0);
    }
  }

  var node, i;
  for (i = 0; i < attrs.length; i++) {
    node = attrs[i];
    if (/^ubt-data-(\w+)/.test(node.name)) {
      result[RegExp.$1] = node.value;
    }
  }

  return util.assign(baseData, result);

};
