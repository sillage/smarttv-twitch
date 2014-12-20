var Language = new function() {
	/**
	 * Applies language to all available html elements, using LanguageStrings.
	 * 
	 * For example: LanguageStrings = { test: 'TEST', inner: {test: 'TeST2'} }
	 * will replace content of all elements with class .label_test with TEST
	 * and content of all elements with class .label_inner_test with TeST2
	 * 
	 * PS: { inner: {test: 'TeST2'} } is equivalent to { inner_test: 'TeST2' }
	 */
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