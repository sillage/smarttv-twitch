var Configuration = new function() {
	var CONFIGURATION_VERSION = 1;
	var DEFAULT_CONFIGURATION_LOCATION = 'app/configuration.json';

	var FILESYSTEM = new FileSystem();
	
	var APPLICATION_ID = curWidget.id
	var USER_CONFIGURATION_LOCATION = APPLICATION_ID + '/' + CONFIGURATION_VERSION + '_configuration.json';
	
	var configuration = { };

	/**
	 * Reads default and user configuration into memory
	 */
	this.load = function() {
		// load default configuration
		var file = FILESYSTEM.openFile(DEFAULT_CONFIGURATION_LOCATION, 'r');
		try {
			configuration = $.extend({}, configuration, $.parseJSON(file.readAll()));
		}
		finally {
			FILESYSTEM.closeCommonFile(file);
		}
		
		// try to load user configuration (best effort)
		try {
			// sometimes widget dir does not exists
			if (!FILESYSTEM.isValidCommonPath(APPLICATION_ID)) {
				FILESYSTEM.createCommonDir(APPLICATION_ID);
			}
			
			// init user configuration if its missing
			if (!FILESYSTEM.isValidCommonPath(USER_CONFIGURATION_LOCATION)) {
				file = FILESYSTEM.openCommonFile(USER_CONFIGURATION_LOCATION, 'w');
				FILESYSTEM.closeCommonFile(file);
			}

			// read user configuration
			file = FILESYSTEM.openCommonFile(USER_CONFIGURATION_LOCATION, 'r');
			try {
				configuration = $.extend({}, configuration, $.parseJSON(file.readAll()));
			}
			finally {
				FILESYSTEM.closeCommonFile(file);
			}
		}
		catch(e) {
			alert('Error while accessing user configuration: ' + e);
		}
	};
	
	/**
	 * Saves user configuration to device
	 */
	this.save = function() {
		var file = FILESYSTEM.openCommonFile(USER_CONFIGURATION_LOCATION, 'w');
		if (file) {
			try {
				file.writeAll($.toJSON(configuration));
			}
			finally {
				FILESYSTEM.closeCommonFile(file);
			}
		}
	};
	
	this.get = function(key) {
		return configuration[key];
	};
	
	this.set = function(key, value) {
		configuration[key] = value;
	};
};
