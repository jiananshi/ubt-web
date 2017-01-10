
var useBuiltin = false;
try {
  localStorage.setItem('ubt-storage-detect-test', '[]');
  // no error, then it works
  useBuiltin = true;
} catch (error) {}

var mockedStorage = {};

function UbtStorage(key) {
  this.key = key || 'default-ubt-storage-key';
};

UbtStorage.prototype.get = function() {
  if (useBuiltin) {
    var raw = localStorage.getItem(this.key);
    if (typeof raw === 'string') {
      return JSON.parse(raw);
    }
  } else {
    return mockedStorage[this.key];
  }
};

UbtStorage.prototype.reset = function(x) {
  // console.log('Reset', this.get());
  this._reset(x);
};

UbtStorage.prototype._reset = function(x) {
  if (useBuiltin) {
    localStorage.setItem(this.key, JSON.stringify(x));
  } else {
    mockedStorage[this.key] = x;
  }
};

// only write data when it's undefined
UbtStorage.prototype.prepare = function(x) {
  var y = this.get();
  if (y == null) {
    this._reset(x);
  }
};

// suppose the inside here is an array
UbtStorage.prototype.append = function(x) {
  this.prepare([]);
  var prevData = this.get();
  if (useBuiltin) {
    // also mutable array
    prevData.push(x);
    this._reset(prevData);
  } else {
    // mutable array
    prevData.push(x);
  }
};

module.exports = UbtStorage;
