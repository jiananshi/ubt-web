// 去除字符串头尾空白字符，压缩中间连续空白字符，并将太长的字符串中间部分省略
export default function(data) {
  if(data === void 0) data = null;
  if(typeof data !== 'string') return data;
  return String(data).replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ').replace(/^(.{7})(.{7,})(.{7})$/, function($0, $1, $2, $3) {
    return $1 + '(' + $2.length + ')' + $3;
  });
};
