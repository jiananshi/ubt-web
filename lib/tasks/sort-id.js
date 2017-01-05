
var UBT = require('../kernel');
var configs = require('../configs');

var loopMaxNumber = 1000000;

// These lines of code are for validating purpose
// sort_id is mainly used for validating
UBT.params.sort_id = function() {
  var stateSortId = 0;
  try {
    var raw = localStorage.getItem(configs.sortIdKey) || '0';
    stateSortId = parseInt(raw, 10);
    // notice: if NaN, the condition will always be false
    if (stateSortId <= loopMaxNumber) {
      stateSortId += 1;
    } else {
      stateSortId = 0;
    }
    localStorage.setItem(configs.sortIdKey, stateSortId.toString());
  } catch (error) {
    // localStorage might fail
  }
  return stateSortId;
};
