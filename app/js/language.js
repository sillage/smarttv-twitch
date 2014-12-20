var Language = new function() {
	this.apply = function() {
		$('.channelname').attr("placeholder", LanguageStrings['open_placeholder']);

		applyRecursive('', LanguageStrings);
	};
	
	function applyRecursive(prefix, strings) {
		for (var key in strings) {
			var prefixKey = prefix + '_' + key;
			var value = strings[key];
			if (typeof value == 'string' || value instanceof String) {
				$('.label' + prefixKey).html(value)
			} 
			else { // assume object
				applyRecursive(prefixKey, value);
			}
		}
	}
};