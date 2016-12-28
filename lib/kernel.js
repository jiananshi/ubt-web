
var uuid = require('./util/uuid');
var createSsid = require('./util/index').createSsid;
var createCookie = require('./util/index').createCookie;
var trackEvent = require('./util/batching').trackEvent;

// 初始化一个 InternalUBT 内部类
var InternalUBT = function(type, data) {
  this.type = type || 'UNKNOWN';
  this.params = data || {};
};

// 绑定数据并生成一个新的 InternalUBT 对象
InternalUBT.prototype.bindData = function() {
  // data 继承于 this.params
  var Midware = function() {};
  Midware.prototype = this.params;
  var data = new Midware();
  // 将参数中的对象列表复制到 data 上
  for (var i = 0; i < arguments.length; i++) {
    var object = arguments[i];
    for (var key in object) {
      data[key] = object[key];
    }
  }
  // 创建一个新的 InternalUBT
  return new InternalUBT(this.type, data);
};

// 绑定类型并生产一个新的 InternalUBT 对象
InternalUBT.prototype.bindType = function(type) {
  return new InternalUBT(type, this.params);
};

// 一个更易用的 bind 方法
InternalUBT.prototype.bind = function() {
  var args = Array.prototype.slice.call(arguments);
  var type = typeof args[0] === 'string' ? args.shift() : this.type;
  // 与当前的 params 合并
  var data = this.bindData.apply(this, args).params;
  return new InternalUBT(type, data);
};

// send 方法定义 .send(type, args...)
InternalUBT.prototype.send = function() {
  // 与当前的 params 合并
  var sububt = this.bind.apply(this, arguments);
  // 取出参数
  var data = sububt.params;
  // 添加 type
  var type = data.type = sububt.type;
  // 处理 type
  if (type === 'PV') {
    // 当 type 为 PV 时需要更新 pvhash
    UBT.params.pvhash = uuid();
  }
  // 将后续参数中的对象全部 extend 到 data 中
  for (var key in data) {
    var value = data[key];
    // 如果参数是一个函数则调用取结果，支持：.send({ name: func });
    if (typeof value === 'function') {
      data[key] = value();
    } else {
      // 消除原型引用
      data[key] = data[key];
    }
  }
  // 发送
  if (window.UBT_DEBUG != null) {
    window.UBT_DEBUG(data);
  } else if (document.cookie.match(/(?:; |^)UBT=([^;]*)|$/)[1] === 'debug') {
    console.log(data);
  } else {
    trackEvent(data);
  }
};

var initialization = new function() {
  // 尝试获取当前根域名
  var domain = /(?:[\w-]+\.)?[\w-]+$|$/i.exec(document.domain || '')[0];
  // 尝试获取已经存储下来的 ubt-ssid
  if (domain) {
    // 如果存在域名则表示这是一个正常的环境，从 Cookie 中取 ubt-ssid
    this.ssid = document.cookie.match(/(?:^|; )ubt_ssid=(.*?)(?:; |$)|$/)[1];
  } else {
    // 否则可能是写不了 Cookie 的 Cordova 之类的环境，尝试从 localStorage 获取 ubt-ssid
    try {
      this.ssid = localStorage.getItem('ubt_ssid');
    } catch (error) {
      // 如果连 localStorage 都用不了就跑异常
      setTimeout(function() { throw error; });
    }
  }
  // 如果不存在则初始化 ubt-ssid（种植第一方 Cookie）
  if (!this.ssid) {
    this.ssid = createSsid();
    if (domain) {
      // 如果能获取到域名就将 ssid 存入根域的根目录 Cookie
      document.cookie = createCookie(this.ssid, domain);
    } else {
      // 否则可能是写不了 Cookie 的 Cordova 之类的环境，尝试使用 localStorage
      try {
        localStorage.setItem('ubt_ssid', this.ssid);
      } catch (error) {
        // 如果连 localStorage 都用不了就跑异常
        setTimeout(function() { throw error; });
      }
    }
  }
  // 为每个请求加一个时间戳
  this.timestamp = function() { return new Date().getTime().toString(36); };
}();

// 初始化 UBT
var UBT = new InternalUBT('DEFAULT', initialization);

module.exports = UBT;
