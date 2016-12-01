// 获取元素值（label 可以取与之关联的控件值）
var getRelatedValue = function(element) {
  var input;
  switch (element.tagName) {
    case 'A':
      return element.getAttribute('href');
    case 'INPUT':
      if (/checkbox|radio/.test(element.type)) return element.checked;
      break;
    case 'TEXTAREA':
      return element.value;
    case 'SELECT':
      var options = element.getElementsByTagName('option');
      for (var i = 0; i < options.length; i++) {
        if (options[i].selected) {
          return options[i].hasAttribute('value') ? options[i].getAttribute('value') : options[i].innerHTML;
        }
      }
      return null;
    default:
      if (element.tagName === 'LABEL' || element.hasAttribute('ubt-label')) {
        var id = element.getAttribute('for');
        input = id ? document.getElementById(id) : element.querySelector('input,textarea');
        return input ? getRelatedValue(input) : null;
      }
  }
};

module.exports = getRelatedValue;
