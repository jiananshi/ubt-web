
window.UBT_DEBUG = function(data) {
  if (typeof onsend === 'function') onsend(data);
};
