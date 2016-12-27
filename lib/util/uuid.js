// 生成随机字符串的函数
module.exports = function() {
  var s = '';
  for (var i = 0; i < 4; i++) {
    s += '0000000'.concat(Math.floor(Math.random() * 2821109907456).toString(36)).slice(-8);
  }
  return s;
};

