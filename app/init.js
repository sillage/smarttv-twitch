function onStart () {
	$(document).ready(function() {
		Nav.init();
		Language.apply();
		Status.init('#throbber', '#message');

		setTimeout(function lazyStart() {
			Status.clearMessage();

			Status.signalStart();
			try {
				initPlayer();

				Nav.openBrowser(Nav.BROWSER_MODE_ALL);
			}
			finally {
				Status.signalEnd();
			}
		}, 0);
	});

	function initPlayer() {
		Player.init('pluginObjectPlayer');

		Player.onError = function(status) {
			Player.onCompleted();

			var message = 'Unexpected error';
			switch (status) {
				case 'connection':
					message = LanguageStrings.Error.connection_fail;
				break;
				case 'network':
					message = LanguageStrings.Error.network_disconnect;
				break;
				case 'renderer':
					if (quality == "High"
						|| quality == "Medium"
						|| quality == "Low") {
						message = LanguageStrings.Error.render_fixed;
						}
					else {
						message = LanguageStrings.Error.render_source;
					}
				break;
				case 'authentication':
					message = LanguageStrings.Error.authentication_fail;
				break;
				case 'notfound':
					message = LanguageStrings.Error.stream_not_found;
				break;
			}

			Status.showMessage(message);
		};

		Player.onCompleted = function() { 
			Player.stop();

			Nav.back();
		};

		Player.onBufferingStarted = function () { 
			Status.signalStart(); 
			Status.showMessage(LanguageStrings.buffering + '...'); 
		};
		
		Player.onBufferingProgress = function (percent) { 
			Status.showMessage(LanguageStrings.buffering + ': ' + percent + '%'); 
		};
		
		Player.onBufferingEnded = function () { 
			Status.clearMessage(); 
			Status.signalEnd(); 
		};
	}
}

function onDestroy () {
	Player.stop();
}
