var Player = new function() {
	'use strict';

	var player = null;
	
	var url = null;
	var retryCount = 0;
	var maxRetries = 3;

	this.init = function(id) {
		player = document.getElementById(id);
		// 960x540 means maximum resolution of the display
		player.SetDisplayArea(0, 0, 960, 540);

		player.OnConnectionFailed = function() {
			if (++retryCount < maxRetries) {
				alert('Player.retry(' + retryCount + ', ' + maxRetries + ')');
				this.play(url);
			}
			else {
				alert('Player.onError(connection)');
				this.onError('connection');
			};
		};

		player.OnNetworkDisconnected = function() {
			alert('Player.onError(network)');
			this.onError('network');
		};

		player.OnRenderError = function() {
			alert('Player.onError(renderer)');
			this.onError('renderer');
		};

		player.OnAuthenticationFailed = function() {
			alert('Player.onError(authentication)');
			this.onError('authentication');
		};

		player.OnStreamNotFound = function() {
			alert('Player.onError(notfound)');
			this.onError('notfound');
		};

		player.OnRenderingComplete = function() {
			alert('Player.onCompleted()');
			this.onCompleted();
		};

		player.OnBufferingStart = function() {
			alert('Player.onBufferingStarted()');
			this.onBufferingStarted();
		};

		player.OnBufferingComplete = function() {
			alert('Player.onBufferingEnded()');
			retryCount = 0; 
			this.onBufferingEnded();
		};

		player.OnBufferingProgress = function (progress) { 
			alert('Player.onBufferingProgress('+ progress +')');
			this.onBufferingProgress(progress);
		};
	};
	
	this.play = function(source) {
		this.stop();

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
