import { UBT } from 'src/kernel';

import 'src/timing';
import 'src/event/click';
import 'src/event/change';
import 'src/event/error';

void function() {
  switch(true) {
    case typeof angular === 'object' && typeof angular.module === 'function':
      return angular.module('UBT', []).factory('UBT', function() { return UBT; });
    case typeof define === 'function' && !!define.amd:
      return define(function() { return UBT; });
    default:
      [eval][0]('var UBT');
      window.UBT = UBT;
  }
}();

