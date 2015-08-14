var parents = require('./parents');

// 获取元素相关信息（控件可以取与之关联的 label 文字）
module.exports = function(element) {
  var label;
  if(element.tagName === 'INPUT') {
    label = element.id && document.querySelector('[for="' + element.id + '"]');
    if(!label) {
      parents(element, function(element) {
        if(element.tagName !== 'LABEL' && !element.hasAttribute('ubt-label')) return;
        label = element;
        return false;
      });
    }
    if(label) element = label;
  }
  var text;
  // 文本域和下拉框不从内容取文本
  if(!/TEXTAREA|SELECT/.test(element.tagName)) text = String(element.textContent || element.innerText || '').replace(/^\s+|\s+$/g, '');
  return text || element.title || element.alt || element.name || element.getAttribute('placeholder');
};
