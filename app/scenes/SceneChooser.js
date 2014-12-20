var SceneSceneChooser = function(options) {
	'use strict';

	var cursorX = 0;
	var cursorY = 0;

	this.initialize = function() { 
		Language.apply();
	};

	this.handleShow = function(data) {
		sf.service.setVolumeControl(true);
	};

	this.handleHide = function() {
	};

	this.handleFocus = function() {
	};

	this.handleBlur = function() { };

	this.handleKeyDown = function(keyCode) {
		switch (keyCode) {
			case sf.key.UP:
					cursorY = 0;
					refreshInputFocus();
				break;
			case sf.key.DOWN:
					cursorY = 1;
					refreshInputFocus();
				break;
			case sf.key.ENTER:
				if (cursorY == 0) {
					var ime = new IMEShell_Common();
					ime.inputboxID = 'streamname_input';
					ime.inputTitle = 'Channel name';
					ime.setOnCompleteFunc = function(string) {};
					ime.onShow();
				}
				else {
					Nav.openStream($('#streamname_input').val());
				}
				break;
			case sf.key.RED:
				Nav.openBrowser(Nav.BROWSER_MODE_ALL);
				break;
			case sf.key.GREEN:
				Nav.openBrowser(Nav.BROWSER_MODE_GAMES);
				break;
			case sf.key.YELLOW:
				$('#streamname_input').val('');
				break;
		}
	};

	function refreshInputFocus() {
		$('#streamname_input').removeClass('channelname');
		$('#streamname_input').removeClass('channelname_focused');
		$('#streamname_button').removeClass('button_go');
		$('#streamname_button').removeClass('button_go_focused');
		
		if (cursorY == 0) {
			$('#streamname_input').addClass('channelname_focused');
			$('#streamname_button').addClass('button_go');
		}
		else {
			$('#streamname_input').addClass('channelname');
			$('#streamname_button').addClass('button_go_focused');
		}
	}
};
