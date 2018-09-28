'use strict';

function clone(instance) {
	let values = {};

	values._class = instance._class;

	Object.keys(instance._attributes).forEach(function(attribute) {
		if (typeof instance[attribute] == 'undefined' || instance[attribute] === null) {
			return;
		}

		let attrObj = instance._attributes[attribute];

		if (attrObj.isArray) {
			let newValues = instance[attribute].map(function(el) {
				return attrObj.isPrimitive ? el : el.clone();
			});

			values[attribute] = newValues;
		} else if (attrObj.isPrimitive) {
			values[attribute] = instance[attribute];
		} else {
			values[attribute] = instance[attribute].clone();
		}
	});

	return new instance.constructor(values);
}

module.exports = clone;