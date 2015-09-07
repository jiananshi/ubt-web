var angular = require('./angular');
module.exports = angular.module('UBT', []).factory('UBT', ['$rootScope', function($rootScope) {
  return require('../lib/entry.js').bindData({
    user_id: function() {
      return $rootScope.user && $rootScope.user.id;
    },
    geohash: function() {
      try {
        return localStorage.getItem('GEOHASH') || '';
      } catch(error) {
        return '';
      }
    }
  });
}]);
