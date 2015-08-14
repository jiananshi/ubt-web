require('./module').config(['$httpProvider', function($httpProvider) {
  var TIMEOUT = 5000;
  // 拦截全局 HTTP 请求，用于统计
  $httpProvider.interceptors.push(['$q', 'UBT', function($q, UBT) {
    var requestHandler = function(config) {
      config.customData = {
        beginstamp: new Date(),
        config: config,
        timer: setTimeout(function() {
          UBT.send('APITIMEOUT', { url: config.url, timeout: TIMEOUT });
        }, TIMEOUT)
      };
      return config;
    };
    var responseHandler = function(response) {
      var config = response.config;
      var report = UBT.bind({
        status: response.status,
        url: config.url,
        duration: new Date() - config.customData.beginstamp
      });
      clearTimeout(config.customData.timer);
      // 只监控特定的请求
      if([
        /^\/v1\/restaurant$/,
        /^\/restapi\/v1\/user$/
      ].some(function(regexp) { return regexp.test(config.url); })) {
        // 在下一个消息中执行 ubt，因为此刻业务代码尚未执行完毕
        setTimeout(function() { return report.send('API'); });
      }
      var defer = $q.defer();
      var codeType = response.status / 100 | 0;
      if(codeType === 2) {
        defer.resolve(response);
      } else {
        // 接口挂掉时向 UBT 服务器汇报错误
        if(codeType === 5) setTimeout(function() { return report.send('SERVERERROR'); });
        defer.reject(response);
      }
      return defer.promise;
    };
    return {
      request: requestHandler,
      response: responseHandler,
      responseError: responseHandler
    };
  }]);
}]);
