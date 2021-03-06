'use strict';

module.exports = function(message, errorObj) {
	this.message = message + (typeof errorObj == 'undefined' ? '' : '\nDetails: ' + JSON.stringify(errorObj, null, 4)) + '\nStacktrace:';
	this.name = 'InitializationException';

	Error.captureStackTrace(this, this.constructor);
};