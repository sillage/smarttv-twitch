var Ajax = new function() {
	'use strict';

	var DEFAULT_TIMEOUT = 8000;
	var MAX_RETRIES = 3;

	/**
	 * Initiates native AJAX request, and will return RAW response
	 *
	 * @param url 
	 * @param dataType TEXT or JSON
	 * @param success callback
	 * @param error callback
	 * @param stealth if true, Status.signalStart/End won't be signalled (no throbber activity), retry mechanism will also be disabled
	 */
	this.getText = function(url, success, error, stealth) {
		ajax(url, 'text', success, error, stealth);
	};

	/**
	 * Initiates native AJAX request, which will be automatically JSON parsed
	 *
	 * @param url 
	 * @param dataType TEXT or JSON
	 * @param success callback
	 * @param error callback
	 * @param stealth if true, Status.signalStart/End won't be signalled (no throbber activity), retry mechanism will also be disabled
	 */
	this.getJson = function(url, success, error, stealth) {
		ajax(url, 'json', success, error, stealth);
	};

	/**
	 * Initiates native AJAX request, which can be automatically JSON parsed
	 *
	 * @param url 
	 * @param dataType TEXT or JSON
	 * @param success callback
	 * @param error callback
	 * @param stealth if true, Status.signalStart/End won't be signalled (no throbber activity), retry mechanism will also be disabled
	 */
	function ajax(url, dataType, success, error, stealth) {
		ajax_(url, dataType, success, error, stealth, DEFAULT_TIMEOUT, 0, MAX_RETRIES);
	}

	/**
	 * Initiates native AJAX request, which can be automatically JSON parsed
	 *
	 * @param url 
	 * @param dataType TEXT or JSON
	 * @param success callback
	 * @param error callback
	 * @param stealth if true, Status.signalStart/End won't be signalled (no throbber activity), retry mechanism will also be disabled
	 * @param timeout starting timeout, if the request timeouts, it will be automatically retries maxRetries times with longer timeout 
	 * @param retryCount current retry count (for retry mechanism)
	 * @param maxRetries maximum retry count (for retry mechanism)
	 */
	function ajax_(url, dataType, success, error, stealth, timeout, retryCount, maxRetries) {
		if (stealth === undefined) {
			stealth = false;
		}

		var xhr = new XMLHttpRequest();

		xhr.ontimeout = function() {
			if (!stealth && (++retryCount) < maxRetries) {
				xhr.open('GET', url, true);
				// https://github.com/justintv/Twitch-API#rate-limits
				xhr.setRequestHeader("Client-ID", "5k0okpfgbdfizy7fsemlvv3waciwzwx");
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
			xhr.onloadstart = function() { 
				alert('AJAXS('+retryCount+','+dataType+'): ' + url); 
				Status.signalStart(); 
			};
			
			// https://bugs.webkit.org/show_bug.cgi?id=40952
			// xhr.onloadend = function() { Status.signalEnd(); };

			var onloadend = function() {
				alert('AJAXE('+retryCount+','+dataType+'): ' + url);
				Status.signalEnd();
			};
			
			xhr.onload = onloadend;
			xhr.onerror = onloadend;
			xhr.onabort = onloadend;
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != null) { 
				if (!stealth) {
					Status.signalStart();
				}

				try {
					var response = xhr.responseText;
					if (dataType == 'json') {
						try {
								response = $.parseJSON(response);
						}
						catch (e) {
							error('json');
						}
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
		// https://github.com/justintv/Twitch-API#rate-limits
		xhr.setRequestHeader("Client-ID", "5k0okpfgbdfizy7fsemlvv3waciwzwx");
		xhr.timeout = timeout;
		xhr.send(null);
	}
};
