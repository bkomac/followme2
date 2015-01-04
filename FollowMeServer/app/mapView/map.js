'use strict';

angular.module('FollowMe.map', [ 'ngRoute' ])

.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/map', {
		templateUrl : 'mapView/map.html',
		controller : 'MapCtrl'
	});
} ])

.controller('MapCtrl', ['SocketService', function(SocketService) {

	var myOptions = {
		zoom : 13,
		center : new google.maps.LatLng(46.069333, 14.515620),
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	SocketService.init("http://ws.komac.si:4000").onMessage(function() {
		console.log("***Calll back....");
	})

} ]);