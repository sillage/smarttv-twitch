var Status = new function() {
	'use strict';

	var self = this;

	var counter = 0;
	var messageCleanerTimeout;

	var throbberElement;
	var messageElement;
	
	this.init = function(throbber, message) {
		throbberElement = $(throbber);
		messageElement = $(message);
	};
	
	this.signalStart = function() {
		if (++counter > 0) {
			setThrobberVisible(true);
		}
		
		//alert('counter/signalStart: ' + counter);
	};

	this.signalEnd = function() {
		if (--counter == 0) {
			setThrobberVisible(false);
		}
		//alert('counter/signalEnd: ' + counter);
	};
	
	function setThrobberVisible(visible) {
		throbberElement.fadeTo(100, (visible ? 0.9 : 0.0));
	}
	
	this.clearMessage = function(msg) {
		Status.showMessage('');
	};
	
	this.showMessage = function(msg) {
		if (messageCleanerTimeout !== undefined) {
			clearTimeout(messageCleanerTimeout);
		}
		
		setMessage(msg);
		if (msg.length > 0) {
			messageCleanerTimeout = setTimeout(function() { setMessage(''); }, 6000);
		}
	};

	function setMessage(message) {
		messageElement
			.fadeTo(200, 0.0)
			.queue(function() {messageElement.text(message).dequeue();})
			.fadeTo(300, 0.9);
	}
};
