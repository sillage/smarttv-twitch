var Ajax = new function() {
	'use strict';

	var DEFAULT_TIMEOUT = 8000;
	var MAX_RETRIES = 3;

	this.getText = function(url, success, error, stealth) {
		ajax(url, 'text', success, error, stealth);
	};

	this.getJson = function(url, success, error, stealth) {
		ajax(url, 'json', success, error, stealth);
	};

	function ajax(url, dataType, success, error, stealth) {
		ajax_(url, dataType, success, error, stealth, DEFAULT_TIMEOUT, 0, MAX_RETRIES);
	}

	function ajax_(url, dataType, success, error, stealth, timeout, retryCount, maxRetries) {
		if (stealth === undefined) {
			stealth = false;
		}

		var xhr = new XMLHttpRequest();

		xhr.ontimeout = function() {
			if ((++retryCount) < maxRetries) {
				xhr.open('GET', url, true);
				xhr.timeout = (xhr.timeout * 1.6180);
				xhr.send(null);
			} else {
				error('timeout');
				
				if (!stealth) {
					Status.signalEnd();
				}
			}
		};

		if (!stealth) {
			xhr.onloadstart = function() { Status.signalStart(); };
			
			// https://bugs.webkit.org/show_bug.cgi?id=40952
			// xhr.onloadend = function() { Status.signalEnd(); };

			xhr.onload = function() { Status.signalEnd(); };
			xhr.onerror = function() { Status.signalEnd(); };
			xhr.onabort = function() { Status.signalEnd(); };
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != null) { 
				if (!stealth) {
					Status.signalStart();
				}
				try {
					var response = xhr.responseText;
					if (dataType == 'json') {
						response = $.parseJSON(response);
					}

					success(response);
				}
				finally { 
					if (!stealth) {
						Status.signalEnd();
					}
				}
			}
		};

		xhr.open('GET', url, true);
		xhr.timeout = timeout;
		xhr.send(null);
	}
};
