# ELEME Web 产品通用 UBT JS SDK

### Lv.0 基本需求（PV、UV、JSERROR、Performance）

如果需求是「监控访问量」这种程度，则属于这个级别的需求。

这时只需要引入 `ubt.js` 即可

具体的引入方式，推荐使用 `bower`

```bash
bower install git@github.com:eleme/ubt-web.git --save-dev
```

### Lv.1 事件监控需求

##### click 监控

当需求是对某个元素点击进行监控时，就属于这个级别的需求。

首先，让产品经理到大数据组申请一份埋点 ID 列表（每个埋点都有全局的唯一 ID）。

然后需要对 HTML 做一些操作，具体操作如下：

```html
<a href="#" ubt-click="埋点 ID">我是一个需要监控点击的链接</a>

<button ubt-click="埋点 ID">我是一个需要监控点击的按钮</button>

<div ubt-click="埋点 ID">我是一个需要监控点击的元素</div>
```

##### change 监控

同点击监控一样只不过这里监控元素的 change 事件。

```html
<input ubt-change="埋点 ID" />

<select ubt-change="埋点 ID">
  <option value="1">item1</option>
  <option value="2">item2</option>
</select>
```

##### visit 监控

当需要监控一个元素是否在页面上显示时就使用这个。

```html
<div ubt-visit="埋点 ID">aaaa</div>
```

注意，如果元素是隐藏的则不会触发。

而且每个元素的 visit 事件只触发一次，即便把一个元素隐藏掉重新显示出来也不会重发触发。

此外，这个事件并不是实时的，总是有个延迟（因为实现不支持实时监控显示），目前暂定 0.8 秒。

因此，如果一个元素显示后又立即被隐藏掉，那就可能不会触发这个事件。

##### 事件参数补充

有时候事件还需要补充一些额外的参数，这可以通过在元素上设置 ubt-data-* 属性来实现。

```html
<button ubt-click="埋点 ID" ubt-data-username="阿饿君">点击这个按钮会带上 username 参数</button>
```

### Lv.2 定制需求

有时候产品会想出一些神奇的需求，这时候就需要定制。

引入 `ubt.js` 后会再全局定义一个叫 UBT 的对象（注意：Angular 环境不会在全局注册，而是注册一个叫 UBT 的 module 和 factory）。

###### API 描述

```js
var sububt = UBT.bind([type, ] objs...);
var subsububt = sububt.bind(...);
UBT.send([type, ] objs...)
```

###### 用法

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

## 开发

本项目采用 ES6 模块打包，已配置 Makefile

```bash
# 生成 ubt.js 及其压缩版本 ubt.min.js
make build
```

项目中配置了各种测试，开发时请先跑通测试后再提交代码。

```bash
# 构建 ubt.js
make build
# 初始化配置
cd tests
bower install
```

访问：（可能需要搭一个 http 服务器环境）

```
/tests/test.html
```

如果有功能的增加和调整，请同步相应的测试。
