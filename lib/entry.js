module.exports = require('./kernel');

require('./tasks/timing');
require('./tasks/error');
require('./tasks/sort-id');

require('./events/click');
require('./events/change');
require('./events/visit');
require('./events/route');

if (window.UBT_DEBUG_CONFIG != null) {
  require('./util/batching').startSendingLoop(window.UBT_DEBUG_CONFIG);
  require('./sendpv').sendPv();
} else {
  require('./util/crayfish').loadConfig(function(configs) {
    require('./util/batching').startSendingLoop(configs);
    require('./sendpv').sendPv();
  });
}
