var SceneSceneBrowser = function(options) {
	'use strict';

	var PAGE_SIZE = 32;
	var COLUMN_COUNT = 4;

	var MODE_NONE = -1;
	var MODE_ALL = 0;
	var MODE_GAMES = 1;
	var MODE_GAMES_STREAMS = 2;
	var MODE_GO = 3;

	var selectedChannel;
	var gameSelected;

	var mode = MODE_NONE;
	var itemsCount = 0;
	var cursorX = 0;
	var cursorY = 0;

	var loadingData = false;
	var dataEnded = false;

	this.getSelectedChannel = function() {
	  return selectedChannel;
	};

	this.initialize = function() {
		initLanguage();

		$("#streamname_frame").hide();
		switchMode(MODE_ALL);
	};

	function initLanguage() {
		$('.label_channels').html(STR_CHANNELS);
		$('.label_games').html(STR_GAMES);
		$('.label_open').html(STR_OPEN);
		$('.label_refresh').html(STR_REFRESH);
		$('.label_placeholder_open').attr("placeholder", STR_PLACEHOLDER_OPEN);
	}

	this.handleShow = function(data) {
		sf.service.setVolumeControl(true);
	};

	this.handleHide = function() {
		clean();
	};

	this.handleFocus = function() {
		refresh();
	};

	this.handleBlur = function() { };

	this.handleKeyDown = function(keyCode) {
		if (loadingData) {
			return;
		}

		switch (keyCode) {
			case sf.key.RETURN:
				sf.key.preventDefault();

				if (mode == MODE_GAMES_STREAMS) {
					switchMode(MODE_GAMES);
				}
				break;
			case sf.key.LEFT:
				if (mode != MODE_GO) {
					if (cursorX > 0) {
						removeFocus();
						cursorX--;
						addFocus();
					}
				}
				break;
			case sf.key.RIGHT:
				if (mode != MODE_GO) {
					if (cursorX < getCellsCount(cursorY) - 1) {
						removeFocus();
						cursorX++;
						addFocus();
					}
				}
				break;
			case sf.key.UP:
				if (mode != MODE_GO) {
					if (cursorY > 0) {
						removeFocus();
						cursorY--;
						addFocus();
					}
				}
				else {
					cursorY = 0;
					refreshInputFocus();
				}
				break;
			case sf.key.DOWN:
				if (mode != MODE_GO) {
					if (cursorY < getRowsCount() - 1
							&& cursorX < getCellsCount(cursorY + 1)) {
						removeFocus();
						cursorY++;
						addFocus();
					}
				}
				else {
					cursorY = 1;
					refreshInputFocus();
				}
				break;
			case sf.key.ENTER:
				if (mode == MODE_GO) {
					if (cursorY == 0) {
						var ime = new IMEShell_Common();
						ime.inputboxID = 'streamname_input';
						ime.inputTitle = 'Channel name';
						ime.setOnCompleteFunc = function(string) {};
						ime.onShow();
					}
					else {
						selectedChannel = $('#streamname_input').val();
						openStream();
					}
				}
				else if (mode == MODE_GAMES) {
					gameSelected = $('#cell_' + cursorY + '_' + cursorX).attr('data-channelname');
					mode = MODE_GAMES_STREAMS;
					refresh();
				}
				else {
					selectedChannel = $('#cell_' + cursorY + '_' + cursorX).attr('data-channelname');
					openStream();
				}
				break;
			case sf.key.RED:
				switchMode(MODE_ALL);
				break;
			case sf.key.GREEN:
				switchMode(MODE_GAMES);
				break;
			case sf.key.YELLOW:
				switchMode(MODE_GO);
				break;
			case sf.key.BLUE:
				refresh();
				break;
		}
	};

	function loadDataSuccess(result) {
		if (result.length < PAGE_SIZE) {
			dataEnded = true;
		}
		
		var resultRowCount = result.length / COLUMN_COUNT;
		if (result.length % COLUMN_COUNT > 0) {
			resultRowCount++;
		}
		
		var resultIndex = 0;
		for (var resultRowIndex = 0; resultRowIndex < resultRowCount; resultRowIndex++) {
			var rowIndex = itemsCount / COLUMN_COUNT + resultRowIndex;
			var rowElement = $('<tr></tr>');
			
			var columnIndex = 0;
			for (; columnIndex < COLUMN_COUNT && resultIndex < result.length; columnIndex++, resultIndex++) {
				var stream = result[resultIndex];
				rowElement.append(
					createCell(
						rowIndex, 
						columnIndex, 
						stream.name, 
						stream.thumbnail, 
						stream.title, 
						stream.displayName, 
						stream.viewersAsString + ' ' + STR_VIEWER
					)
				);
			}
			
			for (; columnIndex < COLUMN_COUNT; columnIndex++) {
				rowElement.append(createCellEmpty());
			}

			$('#stream_table').append(rowElement);
		}

		itemsCount += result.length;
		
		showTable();
		addFocus();
		loadingData = false;
	}

	function createCell(row_id, coloumn_id, data_name, thumbnail, title, info, info2, info_fill) {
		return $('<td id="cell_' + row_id + '_' + coloumn_id + '" class="stream_cell" data-channelname="' + data_name + '"></td>')
			.html('<img id="thumbnail_' + row_id + '_' + coloumn_id + '" class="stream_thumbnail" src="' + thumbnail + '"/> \
				<div class="stream_text"> \
				<div class="stream_title">' + title + '</div> \
				<div class="stream_info">' + info + '</div> \
				<div class="stream_info">' + info2 + '</div> \
				</div>');
	}

	function createCellEmpty() {
		return $('<td class="stream_cell"></td>').html('');
	}

	function loadData() {
		// Even though loading data after end is safe it is pointless and causes lag
		if (loadingData || (itemsCount % COLUMN_COUNT != 0)) {
			return;
		}
		loadingData = true;
		
		if (mode == MODE_GAMES) {
			Twitch.getGames(
				itemsCount, 
				PAGE_SIZE, 
				loadDataSuccess,
				function() {
					showDialog("Error: Unable to retrieve stream list.");
				}
			);
		}
		else if (mode == MODE_GAMES_STREAMS) {
			Twitch.getStreamsForGame(
				gameSelected,
				itemsCount, 
				PAGE_SIZE, 
				loadDataSuccess,
				function() {
					showDialog("Error: Unable to retrieve stream list.");
				}
			);
		}
		else {
			Twitch.getAllStreams(
				itemsCount, 
				PAGE_SIZE, 
				loadDataSuccess,
				function() {
					showDialog("Error: Unable to retrieve stream list.");
				}
			);
		}
	}

	function showDialog(title) {
		Status.showMessage(title);
	}

	function showThrobber() {
		$("#streamname_frame").hide();
	}

	function showTable() {
		$("#streamname_frame").hide();
		$("#stream_table").show();

		ScrollHelper.scrollVerticalToElementById('thumbnail_' + cursorY + '_' + cursorX, 0);
	}

	function showInput() {
		$("#stream_table").hide();
		$("#streamname_frame").show();
	}

	function switchMode(newMode) {
		if (mode != newMode) {
			mode = newMode;

			$("#tip_icon_channels").removeClass('tip_icon_active');
			$("#tip_icon_games").removeClass('tip_icon_active');
			$("#tip_icon_open").removeClass('tip_icon_active');
			$("#tip_icon_refresh").removeClass('tip_icon_active');
			
			if (mode == MODE_ALL)
			{
				$("#tip_icon_channels").addClass('tip_icon_active');
				refresh();
			}
			else if (mode == MODE_GAMES)
			{
				$("#tip_icon_games").addClass('tip_icon_active');
				refresh();
			}
			else if (mode == MODE_GAMES_STREAMS)
			{
				$("#tip_icon_games").addClass('tip_icon_active');
				refresh();
			}
			else if (mode == MODE_GO)
			{
				$("#tip_icon_open").addClass('tip_icon_active');
				clean();
				showInput();
				refreshInputFocus();
			}
		}
		else {
			refresh();
		}
	}

	function clean() {
		$('#stream_table').empty();
		itemsCount = 0;
		cursorX = 0;
		cursorY = 0;
		dataEnded = false;
	}

	function refresh() {
		if (mode != MODE_GO) {
			clean();
			
			loadData();
		}
	}

	function removeFocus() {
		$('#thumbnail_' + cursorY + '_' + cursorX).removeClass('stream_thumbnail_focused');
	}

	function addFocus() {
		if (cursorY + 5 > itemsCount / COLUMN_COUNT
				&& !dataEnded) {
			loadData();
		}
		
		$('#thumbnail_' + cursorY + '_' + cursorX).addClass('stream_thumbnail_focused');
		
		ScrollHelper.scrollVerticalToElementById('thumbnail_' + cursorY + '_' + cursorX, 0);
	}

	function getCellsCount(posY) {
		return Math.min(
				COLUMN_COUNT,
				itemsCount - posY * COLUMN_COUNT);	
	}

	function getRowsCount() {
		var count = itemsCount / COLUMN_COUNT;
		if (itemsCount % COLUMN_COUNT > 0)
		{
			count++;
		}
		
		return count;
	}

	function refreshInputFocus() {
		$('#streamname_input').removeClass('channelname');
		$('#streamname_input').removeClass('channelname_focused');
		$('#streamname_button').removeClass('button_go');
		$('#streamname_button').removeClass('button_go_focused');
		
		if (cursorY == 0)
		{
			$('#streamname_input').addClass('channelname_focused');
			$('#streamname_button').addClass('button_go');
		}
		else
		{
			$('#streamname_input').addClass('channelname');
			$('#streamname_button').addClass('button_go_focused');
		}
	}

	function openStream() {
		$(window).scrollTop(0);
		sf.scene.show('SceneChannel');
		sf.scene.hide('SceneBrowser');
		sf.scene.focus('SceneChannel');
	}
};
