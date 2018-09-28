'use strict';

function hasErrors(instance) {
	return Object.keys(instance.validate('normal')).length > 0;
}

module.exports = hasErrors;