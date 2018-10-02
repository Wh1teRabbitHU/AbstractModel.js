'use strict';

const InvalidTypeException      = require('../exceptions/invalid-type-exception');
const MissingAttributeException = require('../exceptions/missing-attribute-exception');

const objectUtil                = require('../utils/object');

const updateMethod              = require('../methods/update');

function initializeAttributes(attributes) {
	let obj = {};

	Object.keys(attributes).forEach((key) => {
		if (!key.startsWith('_')) {
			let attributeType = attributes[key];

			if (typeof attributeType == 'undefined' || attributeType === null) {
				throw new InvalidTypeException('Error, the given type is null or undefined!');
			}

			if (objectUtil.isArray(attributeType)) {
				if (attributeType.length !== 1) {
					throw new InvalidTypeException('Error, the given type need an array with only one element!');
				}

				obj[key] = { type: attributeType[0], isArray: true };
			} else if (objectUtil.isObject(attributeType)) {
				obj[key] = attributeType;
			} else {
				obj[key] = { type: attributeType, isArray: false };
			}

			obj[key].isPrimitive = objectUtil.isPrimitive(obj[key].type);
		}
	});

	return obj;
}

function constructor(instance, attributes, values) {
	if (typeof attributes == 'undefined' || attributes === null) {
		throw new MissingAttributeException('Error, the created class has no predefined attributes!');
	}

	instance._attributes = initializeAttributes(attributes);
	instance._errors = {};

	updateMethod(instance, values);
}

module.exports = constructor;