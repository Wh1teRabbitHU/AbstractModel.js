'use strict';

const InvalidTypeException = require('../exceptions/invalid-type-exception');

const objectUtil           = require('../utils/object');

function update(instance, values) {
	if (typeof values == 'undefined' || values === null) {
		return instance;
	}

	for (let attrName of Object.keys(instance._attributes)) {
		let attrObject = instance._attributes[attrName],
			newValue = values[attrName];

		if (typeof newValue == 'undefined') {
			continue;
		}

		if (!attrObject.isPrimitive) { // Custom object
			if (attrObject.isArray) {
				if (newValue === null) {
					newValue = [];
				} else if (!objectUtil.isArray(newValue)) {
					throw new InvalidTypeException('Wrong value type!', {
						attribute: attrName,
						value: newValue
					});
				}

				instance[attrName] = [];

				for (let subValue of newValue) {
					if (objectUtil.instanceOf(subValue, attrObject.type)) {
						instance[attrName].push(subValue);
					} else if (!objectUtil.isPrimitive(attrObject.type) && objectUtil.isObject(subValue)) {
						instance[attrName].push(new attrObject.type(subValue));
					} else {
						throw new InvalidTypeException('Wrong value type!', {
							attribute: attrName,
							value: newValue
						});
					}
				}
			} else if (objectUtil.instanceOf(newValue, attrObject.type)) {
				instance[attrName] = newValue;
			} else if (!objectUtil.isPrimitive(attrObject.type) && objectUtil.isObject(newValue) || newValue === null) {
				instance[attrName] = new attrObject.type(newValue);
			} else {
				throw new InvalidTypeException('Wrong value type!', {
					attribute: attrName,
					value: newValue
				});
			}
		} else if (attrObject.isArray) { // Simple object, array
			if (newValue === null) {
				newValue = [];
			}

			if (!objectUtil.isArray(newValue)) {
				throw new InvalidTypeException('Wrong value type!', {
					attribute: attrName,
					value: newValue
				});
			}

			instance[attrName] = [];

			for (let subValue of newValue) {
				if (objectUtil.instanceOf(subValue, attrObject.type)) {
					instance[attrName].push(subValue);
				} else {
					throw new InvalidTypeException('Wrong value type!', {
						attribute: attrName,
						value: newValue
					});
				}
			}
		} else if (objectUtil.instanceOf(newValue, attrObject.type)) { // Simple object, single
			instance[attrName] = newValue;
		} else {
			throw new InvalidTypeException('Wrong value type!', {
				attribute: attrName,
				value: newValue
			});
		}
	}

	instance.validate();

	return instance;
}

module.exports = update;