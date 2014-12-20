var SceneSceneBrowser = function(options) {
	'use strict';

	var self = this;
	
	var PAGE_SIZE = 32;
	var COLUMN_COUNT = 4;

	var selectedChannel;
	var gameSelected;

	this.mode = Nav.BROWSER_MODE_ALL;
	var itemsCount = 0;

	var cursorX = 0;
	var cursorY = 0;

	var loadingData = false;
	var dataEnded = false;

	this.getSelectedChannel = function() {
	  return selectedChannel;
	};

	this.initialize = function() { 
		Language.apply();
	};

	this.handleShow = function(data) {
		sf.service.setVolumeControl(true);
	};

	this.handleHide = function() { };

	this.handleFocus = function() {
		switchMode(self.mode);
	};

	this.handleBlur = function() { };

	this.handleKeyDown = function(keyCode) {
		if (loadingData) {
			return;
		}

		switch (keyCode) {
			case sf.key.RETURN:
				if (self.mode == Nav.BROWSER_MODE_GAMES_STREAMS) {
					sf.key.preventDefault();

					switchMode(Nav.BROWSER_MODE_GAMES);
				}
				break;
			case sf.key.LEFT:
				if (cursorX > 0) {
					moveTableFocus(cursorX - 1, cursorY);
				}
				break;
			case sf.key.RIGHT:
				if (cursorX < getCellsCount(cursorY) - 1) {
					moveTableFocus(cursorX + 1, cursorY);
				}
				break;
			case sf.key.UP:
				if (cursorY > 0) {
					moveTableFocus(cursorX, cursorY - 1);
				}
				break;
			case sf.key.DOWN:
				if (cursorY < getRowsCount() - 1 && cursorX < getCellsCount(cursorY + 1)) {
					moveTableFocus(cursorX, cursorY + 1);
				}
				break;
			case sf.key.ENTER:
				if (self.mode == Nav.BROWSER_MODE_GAMES) {
					gameSelected = $('#cell_' + cursorY + '_' + cursorX).attr('data-channelname');
					switchMode(Nav.BROWSER_MODE_GAMES_STREAMS);
				}
				else {
					Nav.openStream($('#cell_' + cursorY + '_' + cursorX).attr('data-channelname'));
				}
				break;
			case sf.key.RED:
				Nav.openBrowser(Nav.BROWSER_MODE_ALL);
				break;
			case sf.key.GREEN:
				Nav.openBrowser(Nav.BROWSER_MODE_GAMES);
				break;
			case sf.key.YELLOW:
				Nav.openChooser();
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
						stream.viewersAsString + ' ' + LanguageStrings.viewers
					)
				);
			}
			
			for (; columnIndex < COLUMN_COUNT; columnIndex++) {
				rowElement.append(createCellEmpty());
			}

			$('#stream_table').append(rowElement);
		}

		itemsCount += result.length;
		
		moveTableFocus(cursorX, cursorY);
		loadingData = false;
	}

	function createCell(row_id, column_id, data_name, thumbnail, title, info, info2) {
		var cellClass = (self.mode == Nav.BROWSER_MODE_GAMES) ? 'game' : 'stream';
		return $('<td id="cell_' + row_id + '_' + column_id + '" class="stream_cell '+cellClass+'" data-channelname="' + data_name + '"></td>')
			.html('<img id="thumbnail_' + row_id + '_' + column_id + '" class="stream_thumbnail '+cellClass+'" src="'+thumbnail+'"/> \
				<div class="stream_text"> \
				<div class="stream_title">' + title + '</div> \
				<div class="stream_info">' + info + '</div> \
				<div class="stream_info">' + info2 + '</div> \
				</div>');
	}

	function createCellEmpty() {
		var cellClass = (self.mode == Nav.BROWSER_MODE_GAMES) ? 'game' : 'stream';
		return $('<td class="stream_cell '+cellClass+'"></td>').html('');
	}

	function moveTableFocus(newCursorX, newCursorY) {
		$('#thumbnail_' + cursorY + '_' + cursorX).removeClass('stream_thumbnail_focused');
		
		cursorX = newCursorX;
		cursorY = newCursorY;
		
		var element = $('#thumbnail_' + cursorY + '_' + cursorX).addClass('stream_thumbnail_focused');
		var tableElement = $('#stream_table');
		tableElement.css({'marginTop': parseInt(tableElement.css('marginTop')) - element.offset().top + 90});

		if (!dataEnded && (cursorY + 5 > itemsCount / COLUMN_COUNT)) {
			loadData();
		}
	}

	function switchMode(newMode) {
		self.mode = newMode;

		clean();
		loadData();
	}

	function clean() {
		$('#stream_table').css({'marginTop': 0});
		$('#stream_table').empty();
		itemsCount = 0;
		cursorX = 0;
		cursorY = 0;
		dataEnded = false;
	}

	function loadData() {
		// Even though loading data after end is safe it is pointless and causes lag
		if (loadingData || (itemsCount % COLUMN_COUNT != 0)) {
			return;
		}
		loadingData = true;
		
		if (self.mode == Nav.BROWSER_MODE_GAMES) {
			Twitch.getGames(
				itemsCount, 
				PAGE_SIZE, 
				loadDataSuccess,
				function() {
					loadingData = false;
					Status.showMessage(LanguageStrings.Error.no_games);
				}
			);
		}
		else if (self.mode == Nav.BROWSER_MODE_GAMES_STREAMS) {
			Twitch.getStreamsForGame(
				gameSelected,
				itemsCount, 
				PAGE_SIZE, 
				loadDataSuccess,
				function() {
					loadingData = false;
					Status.showMessage(LanguageStrings.Error.no_game_streams);
				}
			);
		}
		else {
			Twitch.getAllStreams(
				itemsCount, 
				PAGE_SIZE, 
				loadDataSuccess,
				function() {
					loadingData = false;
					Status.showMessage(LanguageStrings.Error.no_streams);
				}
			);
		}
	}

	function getCellsCount(posY) {
		return Math.min(COLUMN_COUNT, itemsCount - posY * COLUMN_COUNT);
	}

	function getRowsCount() {
		var count = itemsCount / COLUMN_COUNT;
		if (itemsCount % COLUMN_COUNT > 0) {
			count++;
		}
		
		return count;
	}
};
