function onStart () {
	setTimeout(function lazyStart() {
		Status.init('#throbber', '#message');
		Status.clearMessage();

		Status.signalStart();
		try {
			initPlayer();

			Ajax.onRequestStarted = function() { Status.signalStart(); };
			Ajax.onRequestEnded = function() { Status.signalEnd(); };

			sf.scene.show('SceneBrowser');
			sf.scene.focus('SceneBrowser');
		}
		finally {
			Status.signalEnd();
		}
	}, 0);
}

function initPlayer() {
	Player.init('pluginObjectPlayer');

	Player.onError = function(status) {
		Player.onCompleted();

		var message = 'Unexpected error';
		switch (status) {
			case 'connection':
				message = STR_ERROR_CONNECTION_FAIL;
			break;
			case 'network':
				message = STR_ERROR_NETWORK_DISCONNECT;
			break;
			case 'renderer':
				if (quality == "High"
					|| quality == "Medium"
					|| quality == "Low") {
					message = STR_ERROR_RENDER_FIXED;
					}
				else {
					message = STR_ERROR_RENDER_SOURCE;
				}
			break;
			case 'authentication':
				message = STR_ERROR_AUTHENTICATION_FAIL;
			break;
			case 'notfound':
				message = STR_ERROR_STREAM_NOT_FOUND;
			break;
		}

		Status.showMessage(message);
	};

	Player.onCompleted = function() { 
		Player.stop();

		sf.scene.show('SceneBrowser');
		sf.scene.hide('SceneChannel');
		sf.scene.focus('SceneBrowser');
	};

	Player.onBufferingStarted = function () { 
		Status.signalStart(); 
		Status.showMessage(STR_BUFFERING + '...'); 
	};
	Player.onBufferingProgress = function (percent) { 
		Status.showMessage(STR_BUFFERING + ': ' + percent + '%'); 
	};
	Player.onBufferingEnded = function () { 
		Status.clearMessage(); 
		Status.signalEnd(); 
	};
}

function onDestroy () {
	Player.stop();
}
