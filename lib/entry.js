module.exports = require('./kernel');

require('./tasks/timing');
require('./tasks/error');

require('./events/click');
require('./events/change');
require('./events/visit');
require('./events/route');

require('./util/batching').startSendingLoop();

require('./util/crayfish').loadConfig(function(configs) {
  console.log(configs);
});
