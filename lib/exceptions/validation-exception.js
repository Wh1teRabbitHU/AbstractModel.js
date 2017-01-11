'use strict';

module.exports = function(message, errorObj) {
	this.name = 'ValidationException' + (typeof errorObj == 'undefined' ? '' : '\nDetails: ' + JSON.stringify(errorObj, null, 4)) + '\nStacktrace:';
	this.message = message;

	Error.captureStackTrace(this, this.constructor);
};