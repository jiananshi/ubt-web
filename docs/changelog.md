
Change log
----

新版的记录 https://github.com/eleme/ubt-web/releases

### `1.3.4`

https://github.elemecdn.com/eleme/ubt-web/1.3.4/ubt.min.js

* 兼容 UBT Crayfish 配置由于特殊原因得到 `null` 的问题

### `1.3.3`

https://github.elemecdn.com/eleme/ubt-web/1.3.3/ubt.min.js

* 事件格式增加 `version` 字段, 以便排查区分数据.

### `1.3.2`

https://github.elemecdn.com/eleme/ubt-web/1.3.2/ubt.min.js

* 由于 `beforeunload` 事件不可靠, 页面通过 `localStorage` 共享统计事件队列.

### `1.3.1` pre-release

https://github.elemecdn.com/eleme/ubt-web/1.3.1/ubt.min.js

* 增加 `sort_id` 用于判断数据连续性

### `1.3.0`

https://github.elemecdn.com/eleme/ubt-web/1.3.0/ubt.min.js

Breaking changes:

* 不再使用 GIF 格式发送统计数据, 切换到新的 POST API 发送
* 同时数据先合并, 然后再发送
* 代码启动时会先读取 Crayfish 的配置, 然后决定是否发送

其他:

* 文件结构调整
* 文档更新. 新的发送信息的格式

### `1.2.2`

https://github.elemecdn.com/eleme/ubt-web/1.2.2/ubt.min.js

* 增加 visit-key 支持

### `1.2.1`

https://github.elemecdn.com/eleme/ubt-web/1.2.1/ubt.min.js

*无功能改变*

### `1.2.0`

https://github.elemecdn.com/eleme/ubt-web/1.2.1/ubt.min.js

* 去掉了对 Angular 的绑定
* 添加对 URL 地址的监控, 包括 History 和 Hash 路由

### `1.1.5`

包含三个版本:

* 核心代码 https://github.elemecdn.com/eleme/ubt-web/1.1.5/ubt.min.js
* 不发送 PV 的版本 https://github.elemecdn.com/eleme/ubt-web/1.1.5/ubt-without-pv.min.js
* Angular 定制版本 https://github.elemecdn.com/eleme/ubt-web/1.1.5/ubt-angular.min.js

### 更早

历史... TODO
