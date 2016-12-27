
事件格式
----

### 合并事件格式

合并后, 部分字段共用. 事件自身的数据以数组形式存放:

```bash
referer: location.href
ssid: SSID_FORMAT
pvhash: PVHASH_FORMAT
data: [
  EVENT_FORMAT
]
```
