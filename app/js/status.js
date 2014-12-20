var Status = new function() {
	'use strict';

	var self = this;

	var MESSAGE_CLEAR_TIMEOUT = 6000;
	var counter = 0;
	var messageCleanerTimeout;

	var throbberElement;
	var messageElement;

	/**
	 * Initializes Status functionality using elements with given jQuery selectors
	 * 
	 * @param throbber selector with should display throbber
	 * @param message selector which will display status messages
	 */
	this.init = function(throbber, message) {
		throbberElement = $(throbber);
		messageElement = $(message);
	};

	/**
	 * Increments status counter and displays throbber if its needed.
	 * 
	 * There should be taken care that there is equal ammount of signalStart() and signalEnd() invocations (for example try .. finally),
	 * as failure to do so will casue throbber to be permamently visible.
	 */
	this.signalStart = function() {
		if (++counter > 0) {
			setThrobberVisible(true);
		}
	};

	/**
	 * Decrements status counter and hides throbber if its needed.
	 * 
	 * There should be taken care that there is equal ammount of signalStart() and signalEnd() invocations (for example try .. finally),
	 * as failure to do so will casue throbber to be permamently visible.
	 */
	this.signalEnd = function() {
		if (--counter == 0) {
			setThrobberVisible(false);
		}
		//alert('counter/signalEnd: ' + counter);
	};

	function setThrobberVisible(visible) {
		throbberElement.fadeTo(100, (visible ? 0.9 : 0.0));
	}

	/**
	 * Clears currently visible message if there is any, same as showMessage('');
	 */
	this.clearMessage = function() {
		Status.showMessage('');
	};
	
	/**
	 * Shows status message for a static ammount of time (MESSAGE_CLEAR_TIMEOUT milliseconds), then clears it in an asynchronous manner.
	 */
	this.showMessage = function(msg) {
		// clear timeout for clearing last message, as we now have a new one
		if (messageCleanerTimeout !== undefined) {
			clearTimeout(messageCleanerTimeout);
		}
		
		setMessage(msg);
		if (msg.length > 0) {
			// start cleaning timer only if there actually is a message
			messageCleanerTimeout = setTimeout(function() { setMessage(''); }, MESSAGE_CLEAR_TIMEOUT);
		}
	};

	function setMessage(message) {
		messageElement
			.fadeTo(200, 0.0)
			.queue(function() {messageElement.text(message).dequeue();})
			.fadeTo(300, 0.9);
	}
};
