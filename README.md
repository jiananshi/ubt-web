# web-ubt 组件

### 接口描述

```js
var typeubt = UBT.bindType(type);
var dataubt = UBT.bindData(objs...);
var sububt = UBT.bind([type, ] objs...);
var subsububt = sububt.bind(...);
UBT.send([type, ] objs...)
```

### 用法

```js
// 记录一个 PV
UBT.send('PV');

// 记录一个带数据的 PV
UBT.send('PV', { a: 233, b: 'xxx' });

// 如果觉得每次要带上 PV 参数麻烦可以这么做
var pv = UBT.bindType('PV');
pv.send({ a: 233, b: 'xxx' });

// 如果需要固定一部分数据可以使用
var ab = UBT.bindData({ a: 233, b: 'xxx' });
var ab.send('PV', { c: 'yyy' });

// 当然也可以数据和类型同时固定
var abpv = UBT.bind('PV', { a: 233, b: 'xxx' });
abpv.send();

// bind* 系列方法均返回一个与 UBT 相同原型的对象，可以链式调用 bind*
var pv = UBT.bindType('PV');
var pva = pv.bindData({ a: 233 });
var pvb = pv.bindData({ b: 'xxx' });
var pvac = pva.bindData({ c: 'yyy' });

// 直接的 bind 方法是一种快捷方式，如果第一个参数是字符串自动被作为 type
var pv = UBT.bind('PV');
var pva = UBT.bind('PV', { a: 233 });
var a = UBT.bind({ a: 233 });

// send 方法与 bind 方法接收的参数形式是一样的
// 如果带上 type 会覆盖掉原有的 type
pv.send('XXX', { a: 123 });

// 有时候需要发送一些动态获取的参数，可以在键值对中使用函数
// 这样每次 send 时会调用函数取值
// TODO: 后续可能加入 promise 支持
UBT.send('PV', {
  rnd: function() {
    return Math.random();
  }
});

// 关于 type 的取值是随意的，根据业务需求来决定，建议使用不分词的全大写字母
// type=PV 是一个特殊情况，它会产生 pvhash
// 这个 UBT 组件中有三个全局参数 ssid, pvhash, type
// ssid 是当前用户唯一标识，储存在 cookie 中名为 ubt_ssid，在首次载入时产生
// pvhash 是每次发送 type=PV 时更新的一个值，用于将离散统计对应到 pv 上
// type 就是上面用到各种 type，用于描述当前记录的类型
```

