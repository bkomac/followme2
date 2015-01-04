'use strict';

describe('FollowMe.version module', function() {
  beforeEach(module('FollowMe.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
