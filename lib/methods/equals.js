'use strict';

const objectUtil = require('../utils/object');

function equals(instance, other) {
	if (typeof other == 'undefined' || other === null || instance.constructor.name !== other.constructor.name) {
		return false;
	}

	return Object.keys(instance._attributes).every(function(key) {
		return objectUtil.isEquals(instance[key], other[key]);
	});
}

module.exports = equals;