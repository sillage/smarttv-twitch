var ScrollHelper = new function() {
	'use strict';

	/**
	 * @param id The id of the element to scroll to.
	 * @param padding Top padding to apply above element.
	 */
	this.scrollVerticalToElementById = function(id, padding) {
		$(window).scrollTop(
			getDocumentVerticalScrollPosition() + getElementVerticalClientPositionById(id) - 0.25 * getViewportHeight() - padding
		);
	};

	var supportsPageOffset = (window.pageXOffset !== undefined);
	var isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
	
	function getDocumentVerticalScrollPosition() {
		return supportsPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	}

	function getViewportHeight() { return isCSS1Compat ? document.documentElement.clientHeight : document.body.clientHeight; }

	function getElementVerticalClientPositionById(id) {
		var element = document.getElementById(id);
		var rectangle = element.getBoundingClientRect();
		return rectangle.top;
	}
};
