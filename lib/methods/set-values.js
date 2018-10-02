'use strict';

const updateMethod = require('../methods/update');

function setValues(instance, values) {
	Object.keys(instance._attributes).forEach(function(key) {
		if (typeof values == 'undefined' || values === null || typeof values[key] == 'undefined') {
			instance[key] = undefined; // eslint-disable-line no-undefined
		}
	});

	updateMethod(instance, values);
}

module.exports = setValues;