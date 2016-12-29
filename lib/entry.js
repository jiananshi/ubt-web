module.exports = require('./kernel');

require('./tasks/timing');
require('./tasks/error');

require('./events/click');
require('./events/change');
require('./events/visit');
require('./events/route');

require('./util/crayfish').loadConfig(function(configs) {
  require('./util/batching').startSendingLoop(configs);
  require('./sendpv').sendPv();
});
