'use strict';

angular.module('FollowMe.map', [ 'ngRoute' ])

.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/map', {
		templateUrl : 'mapView/map.html',
		controller : 'MapCtrl'
	});
} ])

.controller('MapCtrl', [ 'SocketService', '$scope', function(SocketService, $scope) {

	var myOptions = {
		zoom : 13,
		center : new google.maps.LatLng(46.069333, 14.515620),
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map"), myOptions);

	var socket =  SocketService.init("http://ws.komac.si:4000", map);
	socket.onMessage(function(data) {
		console.log("***Call back....");
		console.log("position:" + data);
		
		$scope.users = socket.getOnlineUsers();
		$scope.status = data.user + " emits ...";
		
		$scope.$apply();
	});
	
	$scope.getIcon = function(user) {
		return Utils.getIcon(user);
	}
	 

} ]);