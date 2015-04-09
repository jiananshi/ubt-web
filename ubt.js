var UBT;
void function() {

  // 只有 PV_RECEIVER 才会种植第三方 Cookie
  var NONPV_RECEIVER = 'https://web-ubt.ele.me/par.gif';
  var PV_RECEIVER = 'https://web-ubt.ele.me/tracking.gif';

  // 生成随机字符串的函数
  var unique = function() {
    var s = '';
    for(var i = 0; i < 4; i++) {
      s += '0000000'.concat(Math.floor(Math.random() * 2821109907456).toString(36)).slice(-8);
    }
    return s;
  };

  // 初始化一个 SubUBT 内部类
  var SubUBT = function(type, data) {
    this.type = type || 'UNKNOWN';
    this.params = data || {};
  };
  // 绑定数据并生成一个新的 SubUBT 对象
  SubUBT.prototype.bindData = function() {
    // data 继承于 this.params
    var Midware = function(){};
    Midware.prototype = this.params;
    var data = new Midware();
    // 将参数中的对象列表复制到 data 上
    for(var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      for(var key in object) {
        data[key] = object[key];
      }
    }
    // 创建一个新的 SubUBT
    return new SubUBT(this.type, data);
  };
  // 绑定类型并生产一个新的 SubUBT 对象
  SubUBT.prototype.bindType = function(type) {
    return new SubUBT(type, this.params);
  };
  // 一个更易用的 bind 方法
  SubUBT.prototype.bind = function() {
    var args = Array.prototype.slice.call(arguments);
    var type = typeof args[0] === 'string' ? args.shift() : this.type;
    // 与当前的 params 合并
    var data = this.bindData.apply(this, args).params;
    return new SubUBT(type, data);
  };
  // send 方法定义 .send(type, args...)
  SubUBT.prototype.send = function() {
    // 与当前的 params 合并
    var sububt = this.bind.apply(this, arguments);
    // 取出参数
    var data = sububt.params;
    // 添加 type
    var type = data.type = sububt.type;
    // 处理 type
    var base;
    if(type === 'PV') {
      base = PV_RECEIVER;
      // 当 type 为 PV 时需要更新 pvhash
      UBT.params.pvhash = unique();
    } else {
      base = NONPV_RECEIVER;
    }
    // 将后续参数中的对象全部 extend 到 data 中
    for(var key in data) {
      var value = data[key];
      // 如果参数是一个函数则调用取结果，支持：.send({ name: func });
      if(typeof value === 'function') {
        data[key] = value();
      } else {
        // 消除原型引用
        data[key] = data[key];
      }
    }
    // 发送
    var queryString = encodeURIComponent(JSON.stringify(data));
    new Image().src = base + '?' + queryString;
  };

  // 初始化 UBT
  UBT = new SubUBT('DEFAULT', new function(){
    // 初始化 pvhash
    this.pvhash = unique();
    // 初始化 ubt-ssid（种植第一方 Cookie）
    this.ssid = document.cookie.match(/(?:^|; )ubt_ssid=(.*?)(?:; |$)|$/)[1];
    if(!this.ssid) {
      // 创建一个北京时间的日期字符串作为 ssid 的结尾（TODO: 客户端时间可能是不准确的）
      var t = new Date(new Date().getTime() + 480 * 60000);
      this.ssid = unique() + '_' + [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()].join('-').replace(/\b\d\b/g, '0$&');
      // 获取当前根域名
      var domain = document.domain.match(/[\w-]+\.?[\w-]+$/)[0];
      // 将 ssid 存入根域的根目录 Cookie（localStorage 不能跨域）
      document.cookie = 'ubt_ssid=' + this.ssid + '; Expires=Wed, 31 Dec 2098 16:00:00 GMT; Domain=' + domain + '; Path=/';
    }
  });
}();


// 全局行为
void function() {

  // 兼容的事件绑定
  var on = function(element, type, handler) {
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

  // 遍历祖先级元素
  var forParents = function(element, callback) {
    for(var target = element; target && target.nodeType === 1; target = target.parentNode) {
      if(callback(target) === false) break;
    }
  };

  // 去除字符串头尾空白字符，压缩中间连续空白字符，并将太长的字符串中间部分省略
  var compress = function(data) {
    if(data === void 0) data = null;
    if(typeof data !== 'string') return data;
    return String(data).replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ').replace(/^(.{7})(.{7,})(.{7})$/, function($0, $1, $2, $3) {
      return $1 + '(' + $2.length + ')' + $3;
    });
  };

  // 获取元素相关信息（控件可以取与之关联的 label 文字）
  var getRelatedMessage = function(element) {
    var label;
    if(element.tagName === 'INPUT') {
      label = element.id && document.querySelector('[for="' + element.id + '"]');
      if(!label) {
        forParents(element, function(element) {
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
  var getRelatedValue = function(element) {
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

  // 记录 timing
  void function() {
    if(!window.addEventListener || !window.performance || !window.performance.timing) return;
    addEventListener('load', function() {
      setTimeout(function(){
        var timing = performance.timing;
        var keys = [
          'fetchStart',
          'connectEnd',
          'connectStart',
          'domComplete',
          'domContentLoadedEventEnd',
          'domContentLoadedEventStart',
          'domInteractive',
          'domLoading',
          'domainLookupEnd',
          'domainLookupStart',
          'loadEventEnd',
          'loadEventStart',
          'requestStart',
          'responseEnd',
          'responseStart'
        ];
        var data = {};
        for(var i = 0; i < keys.length; i++) {
          data[keys[i]] = timing[keys[i]] - timing.navigationStart;
        }
        UBT.send('TIMING', data);
      });
    });
  }();

  // 监控全局错误
  void function() {
    // 用于缓存已经发送过的错误信息
    var errorCache = {};
    // 为了防止无限发，这里限制只发送 10 次
    var limit = 10;
    var sendMessage = function(message) {
      if(!message || errorCache[message] || limit <= 0) return;
      UBT.send('JSERROR', { message: message });
      errorCache[message] = true;
      limit--;
    };
    if(window.addEventListener) {
      addEventListener('error', function(e) {
        sendMessage(e.error && e.error.stack);
      });
    } else if(window.attachEvent) {
      attachEvent('onerror', function(msg, url, line) {
        sendMessage([msg, 'url: ' + url, 'line: ' + line].join('\r\n'));
      });
    }
  }();

  // 监控点击事件
  void function() {
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
      forParents(element, function(element) {
        if(element.hasAttribute(key)) sendByElement(element);
      });
    });
  }();

  // 监控值变化事件
  // 逻辑：
  // 如果点击到的是一个控件则直接绑定 change 事件
  // 否则寻找祖先级元素中的 LABEL 并给这个 LABEL 关联的控件绑定 change 事件
  void function() {
    var key ='ubt-change';
    var installed = key + '-installed';
    var bind = function(element, name) {
      on(element, 'change', function(e) {
        var value = getRelatedValue(e.target);
        var message = getRelatedMessage(e.target);
        UBT.send('EVENT', { name: name, action: 'change', value: compress(value), message: compress(message) });
      });
    };
    var tags = [ 'input', 'textarea', 'select' ];
    var install = function(element) {
      if(element[installed]) return;
      element[installed] = true;
      bind(element, element.getAttribute(key));
    };
    var search = function(event) {
      var element = event.target;
      if(!new RegExp(tags.join('|'), 'i').test(element.tagName)) {
        var label = element.tagName === 'LABEL' && element;
        if(!label) {
          forParents(element, function(element) {
            label = element.tagName === 'LABEL' && element;
            if(label) return false;
          });
        }
        if(label) {
          var id = label.getAttribute('for');
          var element = id ? document.getElementById(id) : label.querySelector(tags);
        }
      }
      if(element && element.hasAttribute(key)) install(element);
    };
    // 由于 change 不冒泡，所以需要由一个鼠标或键盘事件来引导
    on(document, 'mousedown', search);
    on(document, 'keydown', search);
  }();

}();

