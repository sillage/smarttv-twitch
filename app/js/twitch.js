var Twitch = new function() {
	'use strict';

	var MODE_GAME = 0;
	var MODE_STREAM = 1;

	this.getAllStreams = function(offset, limit, success, error) {
		Twitch.getStreamsForGame(undefined, offset, limit, success, error);
	};

	this.getStreamsForGame = function(game, offset, limit, success, error) {
		var url = 'https://api.twitch.tv/kraken/streams?limit=' + limit + '&offset=' + offset;
		if (game !== undefined) {
			url = url + '&game=' + encodeURIComponent(game);
		}
		Ajax.getJson(
			url, 
			function(response) { 
				try {
					success(extractGameOrStreamList(response, MODE_STREAM)); 
				}
				catch (e) {
					error('unknown ' + e);
				}
			}, 
			error
		);
	};

	this.getGames = function(offset, limit, success, error) {
		var url = 'https://api.twitch.tv/kraken/games/top?limit=' + limit + '&offset=' + offset;
		Ajax.getJson(
			url, 
			function(response) { 
				try {
					success(extractGameOrStreamList(response, MODE_GAME)); 
				}
				catch (e) {
					error('unknown ' + e);
				}
			}, 
			error
		);
	};

	function extractGameOrStreamList(response, mode) {
		var result = [];

		if (mode == MODE_GAME) {
			var top = response.top;
			for (var i = 0; i < top.length; i++) {
				result.push(extractGameInfo(top[i]));
			}
		}
		else {
			var streams = response.streams;
			for (var i = 0; i < streams.length; i++) {
				result.push(extractStreamInfo(streams[i]));
			}
		}
		
		return result;
	}

	function extractGameInfo(node) {
		return {
			name: node.game.name,
			displayName: node.game.name,
			title: '',
			viewers: node.viewers,
			viewersAsString: addCommas(node.viewers),
			logo: node.game.box.medium,
			thumbnail: node.game.box.medium,
			preview: node.game.box.large
		};
	}
	
	this.getChannelInfo = function (channel, success, error) {
		var url = 'https://api.twitch.tv/kraken/streams/' + channel;
		Ajax.getJson(
			url, 
			function(response) {
				try {
					success(extractStreamInfo(response.stream));
				}
				catch (e) {
					error('unknown ' + e);
				}
			}, 
			error, 
			true
		);
	};

	function extractStreamInfo(node) {
		return {
			name: node.channel.name,
			displayName: node.channel.display_name,
			title: node.channel.status,
			viewers: node.viewers,
			viewersAsString: addCommas(node.viewers),
			logo: node.channel.logo,
			thumbnail: node.preview.medium,
			preview: node.preview.large
		};
	}
	
	function addCommas(nStr) {
		nStr += '';
		var x = nStr.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	this.getChannelToken = function (channel, success, error) {
		var url = 'http://api.twitch.tv/api/channels/' + channel + '/access_token';
		Ajax.getJson(url, success, error);
	};
	
	this.getChannelQualities = function (channel, token, success, error) {
		var url = 'http://usher.twitch.tv/api/channel/hls/' + channel + '.m3u8?type=any&sig=' + token.sig + '&token=' + escape(token.token) + '&allow_source=true';

		Ajax.getText(
			url, 
			function (response, status, xhr) {
				try {
					success(extractQualities(response, status, xhr));
				}
				catch (e) {
					error('unknown ' + e);
				}
			}, 
			error
		);
	};
	
	function extractQualities(input) {
		var result = [];

		var streams = extractStreamDeclarations(input);
		for (var i = 0; i < streams.length; i++) {
			result.push({
				id: extractQualityFromStream(streams[i]),
				url: extractUrlFromStream(streams[i])
			});
		}

		return result;
	}

	function extractStreamDeclarations(input) {
		var result = [];

		var myRegexp = /#EXT-X-MEDIA:(.)*\n#EXT-X-STREAM-INF:(.)*\n(.)*/g;
		var match;
		while (match = myRegexp.exec(input)) {
			result.push(match[0]);
		}

		return result;
	}

	function extractQualityFromStream(input) {
		var myRegexp = /#EXT-X-MEDIA:.*NAME=\"(\w+)\".*/g;
		var match = myRegexp.exec(input);

		var quality;
		if (match !== null) {
			quality = match[1];
		}
		else {
			var values = input.split("\n");
			values = values[0].split(":");
			values = values[1].split(",");
			
			var set = {};
			for(var i = 0; i<values.length; i++) {
				var value = values[i].split("=");
				set[value[0]] = value[1].replace(/"/g, '');
			}
			quality = set.NAME;
		}
		
		return quality;
	}

	function extractUrlFromStream(input) {
		return input.split("\n")[2];
	}
}
