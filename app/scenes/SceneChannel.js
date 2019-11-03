var SceneSceneChannel = function(options) { 
	'use strict';

	var self = this;
	
	var QualityAuto = "Auto";

	var quality = "High";
	var qualityPlaying = quality;
	var qualityPlayingIndex = 2;
	var qualityIndex;
	var qualities;

	var tokenResponse;
	var streamInfoTimer;

	this.channel = '';

	this.initialize = function() { 
		Language.apply();
	};

	this.handleHide = function() {
		Player.stop();
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

		hidePanel();
		$('#stream_info_name').text(self.channel);
		$("#stream_info_title").text("");
		$("#stream_info_viewer").text("");
		$("#stream_info_icon").attr("src", "");

		var lastStreamTitle = '';
		var updateStreamInfo = function(shutdownOnError) {
			Twitch.getChannelInfo(
				self.channel, 
				function (result) {
					if (lastStreamTitle !== result.title) {
						lastStreamTitle = result.title;
						showDialog(result.title);
					}
					
					$("#stream_info_title").text(result.title);
					$("#stream_info_viewer").text(result.viewersAsString + ' ' + LanguageStrings.viewers);
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
			self.channel, 
			function(newTokenResponse) {
				tokenResponse = newTokenResponse;
			
				Twitch.getChannelQualities(
					self.channel, 
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
		var playingUrl = 'http://usher.twitch.tv/api/channel/hls/' + self.channel + '.m3u8?type=any&sig=' + tokenResponse.sig + '&token=' + escape(tokenResponse.token);

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
	return x1 + x2;
}

SceneSceneChannel.updateStreamInfo = function()
{
	var xmlHttp = new XMLHttpRequest();
	
	xmlHttp.ontimeout = function()
	{

	};
	xmlHttp.onreadystatechange = function()
	{
		if (xmlHttp.readyState === 4)
		{ 
			if (xmlHttp.status === 200)
			{
				try
				{
					var response = $.parseJSON(xmlHttp.responseText);
					$("#stream_info_title").text(response.stream.channel.status);
					$("#stream_info_viewer").text(addCommas(response.stream.viewers) + ' ' + STR_VIEWER);
					$("#stream_info_icon").attr("src", response.stream.channel.logo);
				}
				catch (err)
				{
					
				}
				
			}
			else
			{
			}
		}
	};
    xmlHttp.open("GET", 'https://api.twitch.tv/kraken/streams/' + SceneSceneBrowser.selectedChannel, true);
	xmlHttp.timeout = 10000;
	xmlHttp.setRequestHeader('Client-ID', 'anwtqukxvrtwxb4flazs2lqlabe3hqv');
    xmlHttp.send(null);
};

SceneSceneChannel.showPanel = function()
{
	SceneSceneChannel.qualityDisplay();
	$("#scene_channel_panel").show();
};

SceneSceneChannel.hidePanel = function()
{
	$("#scene_channel_panel").hide();
	SceneSceneChannel.quality = SceneSceneChannel.qualityPlaying;
	SceneSceneChannel.qualityIndex = SceneSceneChannel.qualityPlayingIndex;
};

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
		
		var xmlHttp = new XMLHttpRequest();
		
		var theUrl;
		if (SceneSceneChannel.state == SceneSceneChannel.STATE_LOADING_TOKEN)
		{
			theUrl = 'https://api.twitch.tv/api/channels/' + SceneSceneBrowser.selectedChannel + '/access_token';
		}
		else {
			quality = qualities[qualityIndex - 1].id;
		}
		
		xmlHttp.ontimeout = function()
		{
		};
	    xmlHttp.onreadystatechange = function()
		{
			if (xmlHttp.readyState === 4)
			{ 
				if (xmlHttp.status === 200)
				{
					try
					{
						SceneSceneChannel.loadDataSuccess(xmlHttp.responseText);
					}
					catch (err)
					{
						SceneSceneChannel.showDialog("loadDataSuccess() exception: " + err.name + ' ' + err.message);
					}
					
				}
				else
				{
					SceneSceneChannel.loadDataError();
				}
			}
		};
	    xmlHttp.open("GET", theUrl, true);
		xmlHttp.timeout = SceneSceneChannel.loadingDataTimeout;
		xmlHttp.setRequestHeader('Client-ID', 'anwtqukxvrtwxb4flazs2lqlabe3hqv');
	    xmlHttp.send(null);
	}

	function isPanelShown() {
		return $("#scene_channel_panel").css('opacity') >= 0.9;
	}

	function shutdownStream() {
		Player.stop();
		
		Nav.back();
	}
};
