'use strict';

// Declare app level module which depends on views, and components
angular.module('FollowMe', [ 'ngRoute', 'FollowMe.map', 'FollowMe.version' ])

.config([ '$routeProvider', function($routeProvider) {

	$routeProvider.when('/pilab', {
		templateUrl : 'pilabView/pilab.html',
		controller : 'PiLabCtrl'
	}).when('/map', {
		templateUrl : 'mapView/map.html',
		controller : 'MapCtrl'
	}).otherwise({
		redirectTo : '/map'
	});
} ]);
