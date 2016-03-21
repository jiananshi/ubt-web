var angular = require('./angular');
module.exports = angular.module('UBT', []).factory('UBT', ['$rootScope', function($rootScope) {
  return require('../lib/entry.js').bindData({
    user_id: function() {
      return $rootScope.user && $rootScope.user.id;
    },
    city_id: function() {
      try {
        return localStorage.getItem('CITY_ID') || '';
      } catch(error) {
        return '';
      }
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
