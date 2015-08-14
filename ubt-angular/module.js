var angular = require('./angular');
module.exports = angular.module('UBT', []).factory('UBT', function() {
  return require('../lib/entry.js').bindData({
    user_id: function() { return angular.element(document).scope().user.id; },
    geohash: function() { return localStorage.getItem('GEOHASH') || ''; }
  });
});
