var marker;
var poly;
var map;
var panTo = true;
var numPoints = 0;

var socket;

var remoteAddress = "http://ws.komac.si:4000";
var VERSION = "0.1.0";

function init() {

	mapInit();
	
	socket = io(remoteAddress);
	io.emit("login");

}

function mapInit() {
	trace("init map...");

	var myOptions = {
		zoom : 13,
		center : new google.maps.LatLng(46.069333, 14.515620),
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"), myOptions);

	return map;
}

function handleMessagePosition(data) {

	addUser(data, map);

	// alert("pos: "+data.lat);
	var coords = new google.maps.LatLng(data.lat, data.lng);

	// marker=null;
	if (marker == null) {
		var tit = 'User: ' + data.user + ' \nSpeed: ' + convert(data.speed) + ' km/h \nAlt: ' + data.alt + ' m';
		marker = new google.maps.Marker({
			title : tit,
			icon : 'http://labs.google.com/ridefinder/images/mm_20_green.png'
		});
	}
	// marker.setPosition(coords);
	// map.addOverlay(marker);

	if (poly == null) {
		var polyOptions = {
			strokeColor : '#f00',
			strokeOpacity : 0.8,
			strokeWeight : 2
		};
		poly = new google.maps.Polyline(polyOptions);

		// map.addOverlay(poly);

	}

	// var path = poly.getPath();
	// path.push(coords);

	if (panTo)
		map.getMap().panTo(coords);

	numPoints++;
	$('.numPoints').html(numPoints);

	$(".noFollowers").html(data.follows);
	$(".user").html(data.user);
	$(".speed").html(convert(data.speed));
	$(".alt").html(data.alt);
	$(".accurr").html(data.accurracy);

	if (marker != null) {
		marker.title = 'User: ' + data.user + ' \nSpeed: ' + convert(data.speed) + ' km/h \nAlt: ' + alt(data.alt) + ' m';
	}

}

function convert(ms) {
	if (ms != null) {
		var kh = ms * 3.6;
		kh = Math.round(kh * 10) / 10;
	}
	return kh;
}

function alt(alt) {
	return Math.round(alt * 10) / 10;
}

function enablePanTo() {

	if (panTo == false) {
		panTo = true;
	} else {
		panTo = false;
	}

}
var output;
var wsUri;
var websocket = null;
var connected = false;

function getRootUri() {

	return "ws://" + (document.location.hostname == "" ? "localhost" : document.location.hostname) + ":"
			+ (document.location.port == "" ? "8000" : document.location.port);
}

function send_message() {
	// websocket = new WebSocket(wsUri);
	websocket.onopen = function(evt) {
		onOpen(evt);
	};
	websocket.onmessage = function(evt) {
		onMessage(evt);
	};
	websocket.onerror = function(evt) {
		onError(evt);
	};
}
function onOpen(evt) {
	writeToScreen("Connected to Endpoint: " + wsUri);

	// doSend(textID.value);
}
function onMessage(evt) {
	// writeToScreen("Message Received: " + evt.data);
	var jsonObj = JSON.parse(evt.data);
	handleMessagePosition(jsonObj.data);

}

window.addEventListener("load", init, false);

if (!("WebSocket" in window))
	alert("Your browser doesn't have native support for WebSockets. \nPlease try Mozilla, Chrome, Safari or IE 10+.");

function trace(msg) {
	console.log("TRACE: " + msg);
};
function debug(msg) {
	if (LOG_LEVEL <= LogLevel.DEBUG)
		console.log("DEBUG: " + msg);
}
function warn(msg) {
	if (LOG_LEVEL <= LogLevel.WARN)
		console.warn("WARN: " + msg);
}
function error(msg) {
	console.error("***ERROR: " + msg);
};

/////////////////

var userMap = new Map();
var currentIconindx = 0;

function addUser(data, map) {

	var userName = data.user;
	console.log("add user... " + userName);

	var user = userMap.get(userName);
	if (user == null) {
		user = new User();
		user.username = userName;
		user.name = userName;
		user.icon = icon[currentIconindx];
		user.color = color[currentIconindx];
		console.log("currentIconindx: " + currentIconindx);
		currentIconindx++;
		if (currentIconindx > 4)
			currentIconindx = 0;

	}

	var point = new Point();
	point.lat = data.lat;
	point.lng = data.lng;
	point.alt = data.alt;
	point.speed = data.speed;

	user.addPoint(point);

	userMap.put(userName, user);

	refreshView(map);

}

function refreshView(map) {
	$("#infoFrame").html("");
	userMap.each(function(keys, user) {

		var lastPoint = user.points[user.points.length - 1];
		
		//marker display
		var marker = user.marker;
		marker.icon = user.icon;
		marker.title = user.username;

		console.log("**** user:" + user.username + " lp:" + lastPoint.lat + " icon:" + user.icon + " marker:"
				+ user.marker.icon);

		var coords = new google.maps.LatLng(lastPoint.lat, lastPoint.lng);
		marker.setPosition(coords);
		map.addOverlay(marker);
		
		//poly display
		var poly = user.poly;
		poly.strokeColor = user.color;
		
		map.addOverlay(poly);
		
		var path = poly.getPath();
		path.push(coords); 
		
		

		//user list display
		$("#infoFrame").append(
				'<button id="startBtn" class="ui-inputfield ui-inputtext ui-widget ui-state-default ui-corner-all"><img src="'
						+ user.icon + '" alt="" /><span class="ui-button-text ui-a">' + user.username
						+ '</span></button></br>');
	});

}

// entities

var icon = [ 'http://labs.google.com/ridefinder/images/mm_20_red.png',
		'http://labs.google.com/ridefinder/images/mm_20_blue.png',
		'http://labs.google.com/ridefinder/images/mm_20_green.png',
		'http://labs.google.com/ridefinder/images/mm_20_yellow.png' ];

var color = [ '#f00', '#00f', '#0f0', '#0ff' ];

function User() {
	this.points = new Array();
	this.name = "";
	this.username = "";
	this.color = color[0];
	this.icon = icon[0];

	this.title = "";
	this.marker = new google.maps.Marker({
		title : this.username,
		icon : this.icon
	});

	this.poly = new google.maps.Polyline({
		strokeColor : this.color,
		strokeOpacity : 0.8,
		strokeWeight : 2
	});

	this.addPoint = function(point) {
		this.points.push(point);
	};

	this.getPoints = function() {
		return this.points;
	};
}

function Point() {
	this.lat = "";
	this.lng = "";
	this.alt = "";
	this.acur = "";
	this.speed = "";
}

function Map() {
	this.keys = new Array();
	this.data = new Object();

	this.put = function(key, value) {
		if (this.data[key] == null) {
			this.keys.push(key);
		}
		this.data[key] = value;
	};

	this.get = function(key) {
		return this.data[key];
	};

	this.remove = function(key) {
		this.keys.remove(key);
		this.data[key] = null;
	};

	this.each = function(fn) {
		if (typeof fn != 'function') {
			return;
		}
		var len = this.keys.length;
		for (var i = 0; i < len; i++) {
			var k = this.keys[i];
			fn(k, this.data[k], i);
		}
	};

	this.entrys = function() {
		var len = this.keys.length;
		var entrys = new Array(len);
		for (var i = 0; i < len; i++) {
			entrys[i] = {
				key : this.keys[i],
				value : this.data[i]
			};
		}
		return entrys;
	};

	this.isEmpty = function() {
		return this.keys.length == 0;
	};

	this.size = function() {
		return this.keys.length;
	};
};
