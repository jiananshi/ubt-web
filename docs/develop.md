
关于开发
----

### 常用命令

```bash
npm run lint
make build
make test
```

### 配置信息

参数的配置统一写在一个文件当中:

```bash
lib/configs.js
```

部分配置是通过 Crayfish 在线配置的, 可以在这里编辑配置(需要权限).

### 查看发送的数据

开发当中可以覆盖 `UBT_DEBUG` 方法来打印事件:

```js
window.UBT_DEBUG = function(event) {
  console.log(event);
};
```

由于 UBT 加入了事件合并方案, 还可以单独针对合并后的数据进行调试:

```js
window.UBT_DEBUG_BATCH = function(message) {
  console.log(message);
};
```

Crayfish 配置可以 Mock 方便本地测试:

```js
window.UBT_DEBUG_CONFIG = {
  concurrency: 3, // how many ajax requests to send message
  interval: 1000, // interval of checking
  queueSize: 100, // which will trigger a submit
  timeout: 3000 // request request timeout
};
```

### 开发用例

`examples/` 目录存放了很多开发过程和测试当中使用的 HTML 入口文件. 部分逻辑在 `tests/` 目录有设计测试, 某些复杂的副作用和时间相关的行为可以打开 HTML 手动查看.

关于事件合并的逻辑, 可以开启 `lib/util/batching.js` 文件当中的 `log()` 函数和 `configs.verbose` 开关来协助调试.
