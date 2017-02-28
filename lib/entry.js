module.exports = require('./kernel');

require('./tasks/timing');
require('./tasks/error');
require('./tasks/sort-id');

require('./events/click');
require('./events/change');
require('./events/visit');
require('./events/route');

var defaultConfigs = require('./configs');

if (window.UBT_DEBUG_CONFIG != null) {
  require('./util/batching').startSendingLoop(window.UBT_DEBUG_CONFIG);
  require('./sendpv').sendPv();
} else {
  require('./util/crayfish').loadConfig(function(error, configs) {
    if (error != null) {
      require('./util/batching').startSendingLoop(defaultConfigs.crayfish);
      require('./sendpv').sendPv();
    } else {
      require('./util/batching').startSendingLoop(configs);
      require('./sendpv').sendPv();
    }
  });
}
