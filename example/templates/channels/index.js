'use strict';

var fire = require('fire');
var app = fire.app('channels', {modules:['ngRoute']});

app.template('index', '<h1>Sign in</h1><form ng-submit="signInUser(name, password)"><input type="text" placeholder="Name..." ng-model="name"/><input type="password" placeholder="Password..." ng-model="password"/><button type="submit">Sign in</button></form><h1>Register</h1><form ng-submit="registerUser(name, password)"><input type="text" placeholder="Name..." ng-model="name"/><input type="password" placeholder="Password..." ng-model="password"/><button type="submit">Register</button></form>');

app.template('messages', '<form ng-submit="createMessage(text)"><input type="text" ng-model="text"/></form><ul><li ng-repeat="message in messages | orderBy:message.createdAt"><p><b>{{message.user.name}}</b> {{message.text}}</p></li></ul>');

function User() {
	this.name = [this.String, this.Authenticate];
	this.messages = [this.HasMany(this.models.Message)];
}
app.model(User);

function Message() {
	this.user = [this.Automatic, this.BelongsTo(this.models.User), this.AutoFetch];
	this.text = [this.String, this.Required];
	this.createdAt = [this.DateTime, this.Default('CURRENT_TIMESTAMP')];
}
app.model(Message);

Message.prototype.afterCreate = function() {
	return this.channels.MessageChannel.get('test').sendMessage(this);
};

function MessageChannel() {
	//
}
app.channel(MessageChannel);

MessageChannel.prototype.canSubscribe = function(user) {
	return (user && user.name == 'Martijn');
};

function IndexController($scope, UserModel, $location) {
	$scope.registerUser = function(name, password) {
		return UserModel.create({
				name: name,
				password: password
			})
			.then(function() {
				$location.path('/messages');
			});
	};

	$scope.signInUser = function(name, password) {
		return UserModel.authorize({
				name: name,
				password: password
			})
			.then(function() {
				$location.path('/messages');
			});
	};
}
app.controller(IndexController);

IndexController.prototype.view = function() {
	return this.template('index');
};

function MessagesController($scope, UserModel, MessageModel, MessageChannel) {
	MessageModel.find().then(function(messages) {
		$scope.messages = messages;
	});

	var channel = MessageChannel.get('test');
	channel.getMessage(function(message) {
		$scope.messages.push(message);
	});

	$scope.createMessage = function(text) {
		return MessageModel.create({text: text});
	};
}
app.controller(MessagesController);

MessagesController.prototype.viewMessages = function() {
	return this.template('messages');
};

app.start();
