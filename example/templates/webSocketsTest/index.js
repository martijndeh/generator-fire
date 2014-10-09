/* global WebSocket */
'use strict';

var fire = require('fire');
var app = fire.app('webSocketsTest', {modules:['ngRoute']});

app.template('index', '<div><h1>Test</h1><form ng-submit="createMessage(text)"><input type="text" ng-model="text"/></form><h1>1</h1><ul><li ng-repeat="message in messages track by $index">{{message}}</li></ul><h1>2</h1><ul><li ng-repeat="message in messages2 track by $index">{{message}}</li></ul></div>');

function TestChannel() {
	//
}
app.channel(TestChannel);

TestChannel.prototype.getMessage = function(messageMap) {
	// simply echo the message
	this.sendMessage(messageMap);
};

function TestController($scope, TestChannel) { //jshint ignore:line
	$scope.messages = [];
	$scope.messages2 = [];

	var channel = TestChannel.get('test');
	channel.getMessage(function(message) {
		$scope.messages.push(message.text);
	});

	var channel2 = TestChannel.get('test2');
	channel2.getMessage(function(message) {
		$scope.messages2.push(message.text);
	});

	var toggle = false;
	$scope.createMessage = function(text) {
		toggle = !toggle;

		if(toggle) {
			channel.sendMessage({
				event: 'message',
				text: text
			});
		}
		else {
			channel2.sendMessage({
				event: 'message',
				text: text + ' (2)'
			});
		}
	};
}

app.controller(TestController);

TestController.prototype.view = function() {
	return this.template('index');
};

app.start();
