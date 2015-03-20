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
      var t = new Date(Date.now() + 480 * 60000);
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
  var on = function(element, type, handler) {
    if(element.addEventListener) {
      element.addEventListener(type, handler);
    } else if(element.attachEvent) {
      element.attachEvent('on' + type, handler);
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
    var sendByElement = function(target) {
      var name = target.getAttribute('ubt-click');
      // 尽可能地获取点击目标相关信息
      var message= target.textContent || target.innerText || target.value || target.title || target.alt || target.href;
      // 去除头尾空白字符，压缩中间连续空白字符
      message = message.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');
      // 将太长的字符串中间省略
      message = message.replace(/^(.{7})(.{7,})(.{7})$/, function($0, $1, $2, $3) {
        return $1 + '(' + $2.length + ')' + $3;
      });
      UBT.send('EVENT', { name: name, action: 'click', message: message });
    };
    on(document, 'click', function(e) {
      e = e || event;
      var target = e.target || e.srcElement;
      // 只要祖先级元素中存在 ubt-click 属性视为 ubt-click，于是允许嵌套
      while(target) {
        if(target.nodeType === 1 && target.hasAttribute('ubt-click')) sendByElement(target);
        target = target.parentNode;
      }
    });
  }();

}();

