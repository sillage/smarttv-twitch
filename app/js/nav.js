var Nav = new function() {
	'use strict';

	var self = this;
	
	this.BROWSER_MODE_ALL = 0;
	this.BROWSER_MODE_GAMES = 1;
	this.BROWSER_MODE_GAMES_STREAMS = 2;
	this.BROWSER_MODE_GO = 3;

	var BROWSER = 'SceneBrowser';
	var CHOOSER = 'SceneChooser';
	var CHANNEL = 'SceneChannel';
	
	var last;
	var current;

	/**
	 * Initializes all scenes
	 */
	this.init = function() {
		sf.scene.get(BROWSER);
		sf.scene.get(CHOOSER);
		sf.scene.get(CHANNEL);
	};
	
	/**
	 * Sets active channel and opens Channel scene
	  *
	 * If some other scene is already shown, it will show the new scene, hide the current one and then focus the new one.
	 * if it is shown already it'll only casue focus via .handleFocus()
	 *
	 * @param channel name
	 *
	 * @return true if scene was switched, false otherwise
	 */
	this.openStream = function(channel) {
		if (channel !== undefined) {
			sf.scene.get(CHANNEL).channel = channel;
		}
		
		open(CHANNEL);
	};

	/**
	 * Sets active browser mode and opens Browser scene
	 *
	 * If some other scene is already shown, it will show the new scene, hide the current one and then focus the new one.
	 * if it is shown already it'll only casue focus via .handleFocus()
	 *
	 * @param mode of the browser
	 *
	 * @return true if scene was switched, false otherwise
	 */
	this.openBrowser = function(mode) {
		var browserScene = sf.scene.get(BROWSER);
		if (mode !== undefined) {
			browserScene.mode = mode;
		}

		$("#tip_icon_channels").removeClass('tip_icon_active');
		$("#tip_icon_games").removeClass('tip_icon_active');
		$("#tip_icon_open").removeClass('tip_icon_active');
		switch(browserScene.mode) {
			case self.BROWSER_MODE_ALL: 
				$("#tip_icon_channels").addClass('tip_icon_active');
			break;
			case self.BROWSER_MODE_GAMES: 
			case self.BROWSER_MODE_GAMES_STREAMS: 
				$("#tip_icon_games").addClass('tip_icon_active');
			break;
		}

		return open(BROWSER);
	};

	/**
	 * Opens Chooser scene
	 *
	 * @return true if scene was switched, false otherwise
	 */
	this.openChooser = function() {
		$("#tip_icon_channels").removeClass('tip_icon_active');
		$("#tip_icon_games").removeClass('tip_icon_active');
		$("#tip_icon_open").removeClass('tip_icon_active').addClass('tip_icon_active');

		return open(CHOOSER);
	};

	/**
	 * Opens scene that was show last (before the current one)
	 *
	 * If some other scene is already shown, it will show the new scene, hide the current one and then focus the new one.
	 * if it is shown already it'll only casue focus via .handleFocus()
	 *
	 * @return true if scene was switched, false otherwise
	 */
	this.back = function() {
		return open(last);
	};
	
	/**
	 * Opens scene by sceneName
	 *
	 * If some other scene is already shown, it will show the new scene, hide the current one and then focus the new one.
	 * if it is shown already it'll only casue focus via .handleFocus()
	 *
	 * @param sceneName
	 *
	 * @return true if scene was switched, false otherwise
	 */
	function open(sceneName) {
		if (current != sceneName) {
			$("#tip_menu").fadeTo(800, (sceneName == CHANNEL) ? 0 : 0.7);
		
			last = current;
			current = sceneName;

			sf.scene.show(current);
			sf.scene.focus(current);
			
			if (last !== undefined) {
				sf.scene.hide(last);
			}
			
			return true;
		}
		else {
			sf.scene.get(current).handleFocus();
			
			return false;
		}
	}
};
