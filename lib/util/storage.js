
var useBuiltin = false;
try {
  localStorage.setItem('ubt-storage-detect', '[]');
  localStorage.removeItem('ubt-storage-detect');
  // no error, then it works
  useBuiltin = true;
} catch (error) {}

var mockedStorage = {};

function UbtStorage(key) {
  this.key = key || 'default-ubt-storage-key';
};

// get() always returns an array
UbtStorage.prototype.get = function() {
  var result;
  if (useBuiltin) {
    var raw = localStorage.getItem(this.key);
    try {
      result = JSON.parse(raw);
    } catch (error) {}
  } else {
    result = mockedStorage[this.key];
  }
  if (result instanceof Array) {
    return result;
  } else {
    return [];
  }
};

UbtStorage.prototype.set = function(x) {
  if (useBuiltin) {
    localStorage.setItem(this.key, JSON.stringify(x));
  } else {
    mockedStorage[this.key] = x;
  }
};

// suppose the inside here is an array
UbtStorage.prototype.append = function(x) {
  var prevData = this.get();
  // also mutable array
  prevData.push(x);
  this.set(prevData);
};

module.exports = UbtStorage;
