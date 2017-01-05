
var UBT = require('../kernel');
var configs = require('../configs');

var loopMaxNumber = 1000000;

// These lines of code are for validating purpose
// sort_id is mainly used for validating
UBT.params.sort_id = function() {
  var stateSortId = -1; // indicates it's a mocked value
  try {
    var raw = localStorage.getItem(configs.sortIdKey) || '0';
    stateSortId = parseInt(raw, 10);
    if (stateSortId > loopMaxNumber) {
      stateSortId = 0;
    } else {
      stateSortId += 1;
    }
    localStorage.setItem(configs.sortIdKey, stateSortId.toString());
  } catch (error) {
    // localStorage might fail
  }
  return stateSortId;
};
