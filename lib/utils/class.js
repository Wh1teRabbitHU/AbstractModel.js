'use strict';

var objectUtil                = require('./object'),
	moduleUtil                = require('./module'),
	validationUtil            = require('./validation'),
	InvalidTypeException      = require('../exceptions/invalid-type-exception'),
	MissingAttributeException = require('../exceptions/missing-attribute-exception');

// TODO:
// - Path based validation and module loading refactor, using to lower camelcase
// - After initialization every dinamic part of the attributes are given to the inner _attribute object (hasInstance, isArray, Name, Path, etc...)

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

	update(instance, values);
}

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

function setValues(instance, values) {
	Object.keys(instance._attributes).forEach(function(key) {
		if (typeof values == 'undefined' || values === null || typeof values[key] == 'undefined') {
			instance[key] = undefined; // eslint-disable-line no-undefined
		}
	});

	update(instance, values);
}

function equals(instance, other) {
	if (typeof other == 'undefined' || other === null || instance.constructor.name !== other.constructor.name) {
		return false;
	}

	return Object.keys(instance._attributes).every(function(key) {
		return objectUtil.isEquals(instance[key], other[key]);
	});
}

function validate(instance, mode) {
	let values = instance.values;

	mode = mode || moduleUtil.options.validatonMode;

	instance._errors = {};

	Object.keys(values).forEach(function(key) {
		let errors = validationUtil.validate(instance._attributes[key], values[key], mode);

		if (errors.length > 0) {
			instance._errors[key] = errors;
		}
	});

	return instance._errors;
}

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

module.exports = {
	constructor: constructor,
	update: update,
	getValues: getValues,
	setValues: setValues,
	equals: equals,
	validate: validate,
	clone: clone
};