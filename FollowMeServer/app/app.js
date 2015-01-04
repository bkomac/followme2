'use strict';

// Declare app level module which depends on views, and components
angular.module('FollowMe', [ 'ngRoute', 'FollowMe.map', 'FollowMe.version' ])

.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({
		redirectTo : '/map'
	});
} ]);
