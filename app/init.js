function onStart () {
	setTimeout(function lazyStart() {
		Status.init('#throbber', '#message');
		Status.clearMessage();

		Status.signalStart();
		try {
			initPlayer();
			initLanguage();

			Ajax.onRequestStarted = function() { Status.signalStart(); };
			Ajax.onRequestEnded = function() { Status.signalEnd(); };

			Nav.openBrowser(Nav.BROWSER_MODE_ALL);
		}
		finally {
			Status.signalEnd();
		}
	}, 0);

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

			Nav.openBrowser();
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

	function initLanguage() {
			$('.label_channels').html(STR_CHANNELS);
			$('.label_games').html(STR_GAMES);
			$('.label_open').html(STR_OPEN);
	}
}

function onDestroy () {
	Player.stop();
}
