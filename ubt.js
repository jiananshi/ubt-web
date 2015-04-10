(function() {
    "use strict";
    var src$lib$uuid$$uuid = function() {
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
        src$kernel$$UBT.params.pvhash = src$lib$uuid$$uuid();
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

    var src$kernel$$UBT = new src$kernel$$InternalUBT('DEFAULT', new (function() {
      // 初始化 pvhash
      this.pvhash = src$lib$uuid$$uuid();
      // 初始化 ubt-ssid（种植第一方 Cookie）
      this.ssid = document.cookie.match(/(?:^|; )ubt_ssid=(.*?)(?:; |$)|$/)[1];
      if(!this.ssid) {
        // 创建一个北京时间的日期字符串作为 ssid 的结尾（TODO: 客户端时间可能是不准确的）
        var t = new Date(new Date().getTime() + 480 * 60000);
        this.ssid = src$lib$uuid$$uuid() + '_' + [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()].join('-').replace(/\b\d\b/g, '0$&');
        // 获取当前根域名
        var domain = document.domain.match(/[\w-]+\.?[\w-]+$/)[0];
        // 将 ssid 存入根域的根目录 Cookie（localStorage 不能跨域）
        document.cookie = 'ubt_ssid=' + this.ssid + '; Expires=Wed, 31 Dec 2098 16:00:00 GMT; Domain=' + domain + '; Path=/';
      }
    }));

    var src$lib$on$$on = function(element, type, handler) {
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

    var src$timing$$timing = function() {
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
        src$kernel$$UBT.send('TIMING', data);
      });
    };

    if(window.performance && window.performance.timing) src$lib$on$$on(window, 'load', src$timing$$timing);

    var src$compress$$compress = function(data) {
      if(data === void 0) data = null;
      if(typeof data !== 'string') return data;
      return String(data).replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ').replace(/^(.{7})(.{7,})(.{7})$/, function($0, $1, $2, $3) {
        return $1 + '(' + $2.length + ')' + $3;
      });
    };

    var src$lib$parents$$parents = function(element, callback) {
      for(var target = element; target && target.nodeType === 1; target = target.parentNode) {
        if(callback(target) === false) break;
      }
    };

    var src$getrelated$$getRelatedMessage = function(element) {
      var label;
      if(element.tagName === 'INPUT') {
        label = element.id && document.querySelector('[for="' + element.id + '"]');
        if(!label) {
          src$lib$parents$$parents(element, function(element) {
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

    var src$getrelated$$getRelatedValue = function(element) {
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
            return input ? src$getrelated$$getRelatedValue(input) : null;
          }
      }
    };

    // 监控点击事件
    var src$event$click$$key = 'ubt-click';

    var src$event$click$$sendByElement = function(target) {
      var name = target.getAttribute(src$event$click$$key);
      var value = src$getrelated$$getRelatedValue(target);
      var message = src$getrelated$$getRelatedMessage(target);
      // 尽可能地获取点击目标相关信息
      src$kernel$$UBT.send('EVENT', { name: name, action: 'click', message: src$compress$$compress(message), value: src$compress$$compress(value) });
    };

    src$lib$on$$on(document, 'click', function(event) {
      var element = event.target;
      // 如果点击的是一个包裹控件的 label 则不做任何处理，因为这种情况会动触发关联控件的 click 事件 
      if(element.tagName === 'LABEL' && element.querySelector('input,textarea')) return;
      // 只要祖先级元素中存在 ubt-click 属性视为 ubt-click，于是允许嵌套
      src$lib$parents$$parents(element, function(element) {
        if(element.hasAttribute(src$event$click$$key)) src$event$click$$sendByElement(element);
      });
    });

    // 监控值变化事件
    // 逻辑：
    // 如果点击到的是一个控件则直接绑定 change 事件
    // 否则寻找祖先级元素中的 LABEL 并给这个 LABEL 关联的控件绑定 change 事件
    var src$event$change$$key ='ubt-change';
    var src$event$change$$installed = src$event$change$$key + '-installed';
    var src$event$change$$bind = function(element, name) {
      src$lib$on$$on(element, 'change', function(e) {
        var value = src$getrelated$$getRelatedValue(e.target);
        var message = src$getrelated$$getRelatedMessage(e.target);
        src$kernel$$UBT.send('EVENT', { name: name, action: 'change', value: src$compress$$compress(value), message: src$compress$$compress(message) });
      });
    };
    var src$event$change$$tags = [ 'input', 'textarea', 'select' ];
    var src$event$change$$install = function(element) {
      if(element[src$event$change$$installed]) return;
      element[src$event$change$$installed] = true;
      src$event$change$$bind(element, element.getAttribute(src$event$change$$key));
    };
    var src$event$change$$search = function(event) {
      var element = event.target;
      if(!new RegExp(src$event$change$$tags.join('|'), 'i').test(element.tagName)) {
        var label = element.tagName === 'LABEL' && element;
        if(!label) {
          src$lib$parents$$parents(element, function(element) {
            label = element.tagName === 'LABEL' && element;
            if(label) return false;
          });
        }
        if(label) {
          var id = label.getAttribute('for');
          var element = id ? document.getElementById(id) : label.querySelector(src$event$change$$tags);
        }
      }
      if(element && element.hasAttribute(src$event$change$$key)) src$event$change$$install(element);
    };
    // 由于 change 不冒泡，所以需要由一个鼠标或键盘事件来引导
    src$lib$on$$on(document, 'mousedown', src$event$change$$search);
    src$lib$on$$on(document, 'keydown', src$event$change$$search);

    // 用于缓存已经发送过的错误信息
    var src$event$error$$errorCache = {};

    // 为了防止无限发，这里限制只发送 10 次
    var src$event$error$$limit = 10;
    var src$event$error$$sendMessage = function(message) {
      if(!message || src$event$error$$errorCache[message] || src$event$error$$limit <= 0) return;
      src$kernel$$UBT.send('JSERROR', { message: message });
      src$event$error$$errorCache[message] = true;
      src$event$error$$limit--;
    };

    if(window.addEventListener) {
      addEventListener('error', function(e) {
        src$event$error$$sendMessage(e.error && e.error.stack);
      });
    } else if(window.attachEvent) {
      attachEvent('onerror', function(msg, url, line) {
        src$event$error$$sendMessage([msg, 'url: ' + url, 'line: ' + line].join('\r\n'));
      });
    }

    void function() {
      switch(true) {
        case typeof angular === 'object' && typeof angular.module === 'function':
          return angular.module('UBT', []).factory('UBT', function() { return src$kernel$$UBT; });
        case typeof define === 'function' && !!define.amd:
          return define(function() { return src$kernel$$UBT; });
        default:
          [eval][0]('var UBT');
          window.UBT = src$kernel$$UBT;
      }
    }();
}).call(this);