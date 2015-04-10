import { parents} from 'src/lib/parents';

// 获取元素相关信息（控件可以取与之关联的 label 文字）
export var getRelatedMessage = function(element) {
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

// 获取元素值（label 可以取与之关联的控件值）
export var getRelatedValue = function(element) {
  var input;
  switch(element.tagName) {
    case 'A':
      return element.getAttribute('href');
    case 'INPUT':
      if(/checkbox|radio/.test(element.type)) return element.checked;
    case 'TEXTAREA':
      return element.value;
    case 'SELECT':
      var options = element.getElementsByTagName('option');
      for(var i = 0; i < options.length; i++) {
        if(options[i].selected) {
          return options[i].hasAttribute('value') ? options[i].getAttribute('value') : options[i].innerHTML;
        }
      }
      return null;
    default:
      if(element.tagName === 'LABEL' || element.hasAttribute('ubt-label')) {
        var id = element.getAttribute('for');
        var input = id ? document.getElementById(id) : element.querySelector('input,textarea');
        return input ? getRelatedValue(input) : null;
      }
  }
};

