function onStart () {
	setTimeout(function lazyStart() {
		Status.init('#throbber', '#message');
		Status.clearMessage();

		Status.signalStart();
		try {
			Player.init('pluginObjectPlayer');

			sf.scene.show('SceneBrowser');
			sf.scene.focus('SceneBrowser');
		}
		finally {
			Status.signalEnd();
		}
	}, 0);
}

function onDestroy () {
	Player.stop();
}
