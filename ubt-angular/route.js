require('./module').run(['UBT', '$rootScope', function(UBT, $rootScope) {
  // 路由切换，产生新的 pvhash
  var referrer = document.referrer;
  var html = document.documentElement;
  var routeChange = function() {
    UBT.send('PV', {
      resolution: Math.max(html.clientWidth, window.innerWidth || 0) + 'x' + Math.max(html.clientHeight, window.innerHeight || 0),
      location: location.href,
      referrer: referrer
    });
    referrer = location.href;
  };
  $rootScope.$on('$routeChangeSuccess', routeChange);
  $rootScope.$on('$stateChangeSuccess', routeChange);
}]);
