'use strict';

const objectUtil = require('../utils/object');

function getValues(instance) {
	let values = {};

	Object.keys(instance._attributes).forEach(function(key) {
		let value = instance[key],
			attrObject = instance._attributes[key];

		if (objectUtil.isArray(value)) {
			values[key] = value.map(function(element) {
				return attrObject.isPrimitive ? element : element.values;
			});
		} else {
			values[key] = typeof value != 'undefined' && !attrObject.isPrimitive ? instance[key].values : instance[key];
		}
	});

	return values;
}

module.exports = getValues;