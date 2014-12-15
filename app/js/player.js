var Player = new function() {
	'use strict';

	var self = this;
	
	var player;
	
	var url;
	var retryCount = 0;
	var maxRetries = 3;

	this.init = function(id) {
		player = document.getElementById(id);
		// 960x540 means maximum resolution of the display
		player.SetDisplayArea(0, 0, 960, 540);

		player.OnConnectionFailed = function() {
			if (++retryCount < maxRetries) {
				alert('Player.retry(' + retryCount + ', ' + maxRetries + ')');
				self.play(url);
			}
			else {
				alert('Player.onError(connection)');
				self.stop();
				self.onError('connection');
			};
		};

		player.OnNetworkDisconnected = function() {
			alert('Player.onError(network)');
			self.onError('network');
		};

		player.OnRenderError = function() {
			alert('Player.onError(renderer)');
			self.onError('renderer');
		};

		player.OnAuthenticationFailed = function() {
			alert('Player.onError(authentication)');
			self.onError('authentication');
		};

		player.OnStreamNotFound = function() {
			alert('Player.onError(notfound)');
			self.onError('notfound');
		};

		player.OnRenderingComplete = function() {
			alert('Player.onCompleted()');
			self.onCompleted();
		};

		player.OnBufferingStart = function() {
			alert('Player.onBufferingStarted()');
			self.onBufferingStarted();
		};

		player.OnBufferingComplete = function() {
			alert('Player.onBufferingEnded()');
			retryCount = 0; 
			self.onBufferingEnded();
		};

		player.OnBufferingProgress = function (progress) { 
			alert('Player.onBufferingProgress('+ progress +')');
			self.onBufferingProgress(progress);
		};
	};
	
	this.play = function(source) {
		self.stop();

		url = source;
		alert('Player.play('+ source +')');
		player.Play(url);
		player.SetDisplayArea(0, 0, 960, 540);
	}
	
	this.stop = function() {
		alert('Player.stop()');

		retryCount = 0; 
		player.Stop();
	}
	
	this.onError = function() {};
	this.onCompleted = function() {};
	this.onStarted = function() {};

	this.onBufferingProgress = function(progress) {};
	this.onBufferingStarted = function() {};
	this.onBufferingEnded = function() {};
};
