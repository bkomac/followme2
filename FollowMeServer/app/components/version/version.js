'use strict';

angular.module('FollowMe.version', [
  'FollowMe.version.interpolate-filter',
  'FollowMe.version.version-directive'
])

.value('version', '0.1');
