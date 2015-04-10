import { UBT } from 'src/kernel';

if(!window.addEventListener || !window.performance || !window.performance.timing) return;
addEventListener('load', function() {
  setTimeout(function(){
    var timing = performance.timing;
    var keys = [
      'fetchStart',
      'connectEnd',
      'connectStart',
      'domComplete',
      'domContentLoadedEventEnd',
      'domContentLoadedEventStart',
      'domInteractive',
      'domLoading',
      'domainLookupEnd',
      'domainLookupStart',
      'loadEventEnd',
      'loadEventStart',
      'requestStart',
      'responseEnd',
      'responseStart'
    ];
    var data = {};
    for(var i = 0; i < keys.length; i++) {
      data[keys[i]] = timing[keys[i]] - timing.navigationStart;
    }
    UBT.send('TIMING', data);
  });
});

