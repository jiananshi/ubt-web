(function() {
    "use strict";

    var src$lib$uuid$$default = function() {
      var s = '';
      for(var i = 0; i < 4; i++) {
        s += '0000000'.concat(Math.floor(Math.random() * 2821109907456).toString(36)).slice(-8);
      }
      return s;
    };

    // 只有 PV_RECEIVER 才会种植第三方 Cookie
    var src$kernel$$NONPV_RECEIVER = 'https://web-ubt.ele.me/par.gif';
    var src$kernel$$PV_RECEIVER = 'https://web-ubt.ele.me/tracking.gif';

    // 初始化一个 InternalUBT 内部类
    var src$kernel$$InternalUBT = function(type, data) {
      this.type = type || 'UNKNOWN';
      this.params = data || {};
    };

    // 绑定数据并生成一个新的 InternalUBT 对象
    src$kernel$$InternalUBT.prototype.bindData = function() {
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
      // 创建一个新的 InternalUBT
      return new src$kernel$$InternalUBT(this.type, data);
    };

    // 绑定类型并生产一个新的 InternalUBT 对象
    src$kernel$$InternalUBT.prototype.bindType = function(type) {
      return new src$kernel$$InternalUBT(type, this.params);
    };

    // 一个更易用的 bind 方法
    src$kernel$$InternalUBT.prototype.bind = function() {
      var args = Array.prototype.slice.call(arguments);
      var type = typeof args[0] === 'string' ? args.shift() : this.type;
      // 与当前的 params 合并
      var data = this.bindData.apply(this, args).params;
      return new src$kernel$$InternalUBT(type, data);
    };

    // send 方法定义 .send(type, args...)
    src$kernel$$InternalUBT.prototype.send = function() {
      // 与当前的 params 合并
      var sububt = this.bind.apply(this, arguments);
      // 取出参数
      var data = sububt.params;
      // 添加 type
      var type = data.type = sububt.type;
      // 处理 type
      var base;
      if(type === 'PV') {
        base = src$kernel$$PV_RECEIVER;
        // 当 type 为 PV 时需要更新 pvhash
        src$kernel$$UBT.params.pvhash = src$lib$uuid$$default();
      } else {
        base = src$kernel$$NONPV_RECEIVER;
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
    var src$kernel$$UBT = new src$kernel$$InternalUBT('DEFAULT', new (function() {
      // 初始化 ubt-ssid（种植第一方 Cookie）
      this.ssid = document.cookie.match(/(?:^|; )ubt_ssid=(.*?)(?:; |$)|$/)[1];
      if(!this.ssid) {
        // 创建一个北京时间的日期字符串作为 ssid 的结尾（TODO: 客户端时间可能是不准确的）
        var t = new Date(new Date().getTime() + 480 * 60000);
        this.ssid = src$lib$uuid$$default() + '_' + [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()].join('-').replace(/\b\d\b/g, '0$&');
        // 获取当前根域名
        var domain = document.domain.match(/[\w-]+\.?[\w-]+$/)[0];
        // 将 ssid 存入根域的根目录 Cookie（localStorage 不能跨域）
        document.cookie = 'ubt_ssid=' + this.ssid + '; Expires=Wed, 31 Dec 2098 16:00:00 GMT; Domain=' + domain + '; Path=/';
      }
      // 为每个请求加一个时间戳
      this.timestamp = function() { return new Date().getTime().toString(36); };
    }));

    // 发送一个初始 PV
    var src$kernel$$html = document.documentElement;
    src$kernel$$UBT.send('PV', {
      resolution: Math.max(src$kernel$$html.clientWidth, window.innerWidth || 0) + 'x' + Math.max(src$kernel$$html.clientHeight, window.innerHeight || 0),
      location: location.href,
      referrer: document.referrer
    });

    var src$kernel$$default = src$kernel$$UBT;

    var src$lib$on$$default = function(element, type, handler) {
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

    var src$tasks$timing$$timing = function() {
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
        src$kernel$$default.send('TIMING', data);
      });
    };

    if(window.performance && window.performance.timing) src$lib$on$$default(window, 'load', src$tasks$timing$$timing);

    var src$lib$parents$$default = function(element, callback) {
      for(var target = element; target && target.nodeType === 1; target = target.parentNode) {
        if(callback(target) === false) break;
      }
    };

    // 获取元素值（label 可以取与之关联的控件值）
    var src$lib$getrelatedvalue$$getRelatedValue = function(element) {
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
            return input ? src$lib$getrelatedvalue$$getRelatedValue(input) : null;
          }
      }
    };

    var src$lib$getrelatedvalue$$default = src$lib$getrelatedvalue$$getRelatedValue;

    var src$lib$getrelatedmessage$$default = function(element) {
      var label;
      if(element.tagName === 'INPUT') {
        label = element.id && document.querySelector('[for="' + element.id + '"]');
        if(!label) {
          src$lib$parents$$default(element, function(element) {
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

    var src$lib$collectdatafrom$$default = function(element) {

      // 获取两个固有参数
      var result = {
        value: src$lib$getrelatedvalue$$default(element),
        message: src$lib$getrelatedmessage$$default(element)
      };

      // 从元素上获取 ubt-data-* 属性
      var attrs = element.attributes;
      var node, i;
      for(i = 0; i < attrs.length; i++) {
        node = attrs[i];
        if(/^ubt-data-(\w+)/.test(node.name)) {
          result[RegExp.$1] = node.value;
        }
      }
      
      return result;

    };

    // 监控点击事件
    var src$events$click$$key = 'ubt-click';

    var src$events$click$$sendByElement = function(target) {
      src$kernel$$default.send('EVENT', {
        id: target.getAttribute(src$events$click$$key),
        params: src$lib$collectdatafrom$$default(target)
      });
    };

    src$lib$on$$default(document, 'click', function(event) {
      var element = event.target;
      // 如果点击的是一个包裹控件的 label 则不做任何处理，因为这种情况会动触发关联控件的 click 事件 
      if(element.tagName === 'LABEL' && element.querySelector('input,textarea')) return;
      // 只要祖先级元素中存在 ubt-click 属性视为 ubt-click，于是允许嵌套
      src$lib$parents$$default(element, function(element) {
        if(element.hasAttribute(src$events$click$$key)) src$events$click$$sendByElement(element);
      });
    });

    // 监控值变化事件
    // 逻辑：
    // 如果点击到的是一个控件则直接绑定 change 事件
    // 否则寻找祖先级元素中的 LABEL 并给这个 LABEL 关联的控件绑定 change 事件
    var src$events$change$$key ='ubt-change';
    var src$events$change$$installed = src$events$change$$key + '-installed';
    var src$events$change$$bind = function(element, name) {
      src$lib$on$$default(element, 'change', function(e) {
        src$kernel$$default.send('EVENT', {
          id: e.target.getAttribute(src$events$change$$key),
          params: src$lib$collectdatafrom$$default(e.target)
        });
      });
    };
    var src$events$change$$tags = [ 'input', 'textarea', 'select' ];
    var src$events$change$$install = function(element) {
      if(element[src$events$change$$installed]) return;
      element[src$events$change$$installed] = true;
      src$events$change$$bind(element, element.getAttribute(src$events$change$$key));
    };
    var src$events$change$$search = function(event) {
      var element = event.target;
      if(!new RegExp(src$events$change$$tags.join('|'), 'i').test(element.tagName)) {
        var label = element.tagName === 'LABEL' && element;
        if(!label) {
          src$lib$parents$$default(element, function(element) {
            label = element.tagName === 'LABEL' && element;
            if(label) return false;
          });
        }
        if(label) {
          var id = label.getAttribute('for');
          var element = id ? document.getElementById(id) : label.querySelector(src$events$change$$tags);
        }
      }
      if(element && element.hasAttribute(src$events$change$$key)) src$events$change$$install(element);
    };
    // 由于 change 不冒泡，所以需要由一个鼠标或键盘事件来引导
    src$lib$on$$default(document, 'mousedown', src$events$change$$search);
    src$lib$on$$default(document, 'keydown', src$events$change$$search);

    var src$events$visit$$key = 'ubt-visit';

    var src$events$visit$$visit = function(element) {
      src$kernel$$default.send('EVENT', {
        id: element.getAttribute(src$events$visit$$key),
        params: src$lib$collectdatafrom$$default(element)
      });
    };

    var src$events$visit$$checkVisibility = function(element) {
      if(element.offsetWidth + element.offsetHeight) src$events$visit$$visit(element);
    };

    var src$events$visit$$watch = function() {
      var elements = document.querySelectorAll('[ubt-visit]');
      for(var i = 0; i < elements.length; i++) src$events$visit$$checkVisibility(elements[i]);
      setTimeout(src$events$visit$$watch, 1000);
    };

    src$events$visit$$watch();

    // 用于缓存已经发送过的错误信息
    var src$events$error$$errorCache = {};

    // 为了防止无限发，这里限制只发送 10 次
    var src$events$error$$limit = 10;
    var src$events$error$$sendMessage = function(message) {
      if(!message || src$events$error$$errorCache[message] || src$events$error$$limit <= 0) return;
      src$kernel$$default.send('JSERROR', { message: message });
      src$events$error$$errorCache[message] = true;
      src$events$error$$limit--;
    };

    if(window.addEventListener) {
      addEventListener('error', function(e) {
        src$events$error$$sendMessage(e.error && e.error.stack);
      });
    } else if(window.attachEvent) {
      attachEvent('onerror', function(msg, url, line) {
        src$events$error$$sendMessage([msg, 'url: ' + url, 'line: ' + line].join('\r\n'));
      });
    }

    void function() {
      switch(true) {
        case typeof angular === 'object' && typeof angular.module === 'function':
          return angular.module('UBT', []).factory('UBT', function() { return src$kernel$$default; });
        default:
          [eval][0]('var UBT');
          window.UBT = src$kernel$$default;
      }
    }();
}).call(this);