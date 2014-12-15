var SceneSceneChannel = function(options) { 
	'use strict';

	var QualityAuto = "Auto";

	var selectedChannel;
	
	var quality = "Source";
	var qualityPlaying = quality;
	var qualityPlayingIndex = 1;
	var qualityIndex;
	var qualities;

	var tokenResponse;
	var streamInfoTimer;

	this.initialize = function() {
		initLanguage();
	};

	function initLanguage() {
		$('#label_quality').html(STR_QUALITY);
	}

	this.handleHide = function() {
		window.clearInterval(streamInfoTimer);
	};

	this.handleShow = function(data) {
		sf.service.setVolumeControl(true);
	};

	this.handleBlur = function() {
		sf.service.setScreenSaver(false);
	};

	this.handleFocus = function(data) {
		sf.service.setScreenSaver(true, 100000);

		selectedChannel = sf.scene.get('SceneBrowser').getSelectedChannel();

		hidePanel();
		$('#stream_info_name').text(selectedChannel);
		$("#stream_info_title").text("");
		$("#stream_info_viewer").text("");
		$("#stream_info_icon").attr("src", "");

		var lastStreamTitle = '';
		var updateStreamInfo = function(shutdownOnError) {
			Twitch.getChannelInfo(
				selectedChannel, 
				function (result) {
					if (lastStreamTitle !== result.title) {
						lastStreamTitle = result.title;
						showDialog(result.title);
					}
					
					$("#stream_info_title").text(result.title);
					$("#stream_info_viewer").text(result.viewersAsString + ' ' + STR_VIEWER);
					$("#stream_info_icon").attr("src", result.logo);
				},
				function() {
					showDialog("Error: Unable to retrieve stream data.");
					if (shutdownOnError !== undefined && shutdownOnError) {
						shutdownStream();
					}
				}
			);
		};

		streamInfoTimer = window.setInterval(updateStreamInfo, 10000);
		updateStreamInfo(true);

		tokenResponse = null;

		Twitch.getChannelToken(
			selectedChannel, 
			function(newTokenResponse) {
				tokenResponse = newTokenResponse;
			
				Twitch.getChannelQualities(
					selectedChannel, 
					tokenResponse, 
					function(newQualities) {
						qualities = newQualities;
						qualityChanged();
					},
					function() {
						showDialog("Error: Unable to retrieve stream data.");
						shutdownStream();
					}
				);
			},
			function() {
				showDialog("Error: Unable to retrieve access token.");
				shutdownStream();
			}
		);
	};

	this.handleKeyDown = function(keyCode) {
		switch (keyCode) {
			case sf.key.CH_UP:
			case sf.key.N1:
				if (isPanelShown() && qualityIndex > 0) {
					qualityIndex--;
					refreshQualityDisplay();
				}
				break;
			case sf.key.CH_DOWN:
			case sf.key.N4:
				if (isPanelShown() && qualityIndex < qualities.length) {
					qualityIndex++;
					refreshQualityDisplay();
				}
				break;
			case sf.key.LEFT:
				showPanel();
				break;
			case sf.key.RIGHT:
				hidePanel();
				break;
			case sf.key.ENTER:
				if (isPanelShown()) {
					qualityChanged();
				}
				else {
					showPanel();
				}
				break;
			case sf.key.RETURN:
				if (isPanelShown()) {
					hidePanel();
				}
				else {
					shutdownStream();
				}
				sf.key.preventDefault();
				break;
		}
	};

	function qualityChanged() {
		var playingUrl = 'http://usher.twitch.tv/api/channel/hls/' + selectedChannel + '.m3u8?type=any&sig=' + tokenResponse.sig + '&token=' + escape(tokenResponse.token);

		qualityIndex = 0;
		for (var i = 0; i < qualities.length; i++) {
			if (qualities[i].id == quality) {
				qualityIndex = i + 1;
				playingUrl = qualities[i].url;
				break;
			}
		}
		
		if (qualityIndex == 0) {
			quality = QualityAuto;
		}

		qualityPlaying = quality;
		qualityPlayingIndex = qualityIndex;

		Player.play(playingUrl + '|COMPONENT=HLS');
		refreshQualityDisplay();
	}

	function showDialog(title) {
		Status.showMessage(title);
	}

	function showPanel() {
		refreshQualityDisplay();
		$("#scene_channel_panel").fadeTo(300, 0.9);
	}

	function hidePanel() {
		$("#scene_channel_panel").fadeTo(200, 0);
		quality = qualityPlaying;
		qualityIndex = qualityPlayingIndex;
	}

	function refreshQualityDisplay() {
		if (qualityIndex == 0) {
			$('#quality_arrow_up').css({ 'opacity' : 0.2 });
			$('#quality_arrow_down').css({ 'opacity' : 1.0 });
		}
		else if (qualityIndex == qualities.length) {
			$('#quality_arrow_up').css({ 'opacity' : 1.0 });
			$('#quality_arrow_down').css({ 'opacity' : 0.2 });
		}
		else {
			$('#quality_arrow_up').css({ 'opacity' : 1.0 });
			$('#quality_arrow_down').css({ 'opacity' : 1.0 });
		}
		
		if (qualityIndex == 0) {
			quality = QualityAuto;
		}
		else {
			quality = qualities[qualityIndex - 1].id;
		}
		
		$('#quality_name').css({ color: ((qualityPlaying == quality) ? '#000' : '#333')}).text(quality);
	}

	function isPanelShown() {
		return $("#scene_channel_panel").css('opacity') >= 0.9;
	}

	function shutdownStream() {
		Player.stop();
		
		sf.scene.show('SceneBrowser');
		sf.scene.hide('SceneChannel');
		sf.scene.focus('SceneBrowser');
	}
};
