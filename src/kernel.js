import { uuid } from 'src/lib/uuid';

// 只有 PV_RECEIVER 才会种植第三方 Cookie
var NONPV_RECEIVER = 'https://web-ubt.ele.me/par.gif';
var PV_RECEIVER = 'https://web-ubt.ele.me/tracking.gif';

// 初始化一个 InternalUBT 内部类
var InternalUBT = function(type, data) {
  this.type = type || 'UNKNOWN';
  this.params = data || {};
};

// 绑定数据并生成一个新的 InternalUBT 对象
InternalUBT.prototype.bindData = function() {
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
  var base;
  if(type === 'PV') {
    base = PV_RECEIVER;
    // 当 type 为 PV 时需要更新 pvhash
    UBT.params.pvhash = uuid();
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
export var UBT = new InternalUBT('DEFAULT', new function(){
  // 初始化 ubt-ssid（种植第一方 Cookie）
  this.ssid = document.cookie.match(/(?:^|; )ubt_ssid=(.*?)(?:; |$)|$/)[1];
  if(!this.ssid) {
    // 创建一个北京时间的日期字符串作为 ssid 的结尾（TODO: 客户端时间可能是不准确的）
    var t = new Date(new Date().getTime() + 480 * 60000);
    this.ssid = uuid() + '_' + [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()].join('-').replace(/\b\d\b/g, '0$&');
    // 获取当前根域名
    var domain = document.domain.match(/[\w-]+\.?[\w-]+$/)[0];
    // 将 ssid 存入根域的根目录 Cookie（localStorage 不能跨域）
    document.cookie = 'ubt_ssid=' + this.ssid + '; Expires=Wed, 31 Dec 2098 16:00:00 GMT; Domain=' + domain + '; Path=/';
  }
});

// 发送一个初始 PV
var html = document.documentElement;
UBT.send('PV', {
  resolution: Math.max(html.clientWidth, window.innerWidth || 0) + 'x' + Math.max(html.clientHeight, window.innerHeight || 0),
  location: location.href,
  referrer: document.referrer
});

