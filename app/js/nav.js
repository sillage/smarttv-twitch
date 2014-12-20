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

	this.init = function() {
		sf.scene.get(BROWSER);
		sf.scene.get(CHOOSER);
		sf.scene.get(CHANNEL);
	};
	
	this.openStream = function(channel) {
		if (channel !== undefined) {
			sf.scene.get(CHANNEL).channel = channel;
		}
		
		open(CHANNEL);
	};

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

		open(BROWSER);
	};

	this.openChooser = function() {
		$("#tip_icon_channels").removeClass('tip_icon_active');
		$("#tip_icon_games").removeClass('tip_icon_active');
		$("#tip_icon_open").removeClass('tip_icon_active').addClass('tip_icon_active');

		open(CHOOSER);
	};

	this.back = function() {
		open(last);
	};
	
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
