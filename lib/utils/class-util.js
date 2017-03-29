'use strict';

var objectUtil                = require('./object-util'),
	moduleUtil                = require('./module-util'),
	validationUtil            = require('./validation-util'),
	InvalidTypeException      = require('../exceptions/invalid-type-exception'),
	InitializationException   = require('../exceptions/initialization-exception'),
	MissingAttributeException = require('../exceptions/missing-attribute-exception');

function initializeAttributes(attributes) {
	let obj = {};

	Object.keys(attributes).forEach((key) => {
		if (!key.startsWith('_')) {
			if (objectUtil.isString(attributes[key])) {
				obj[key] = { type: attributes[key] };
			} else {
				obj[key] = attributes[key];

				let instance = attributes[key].instance;

				if (typeof instance != 'undefined') {
					let alias = attributes[key].alias || instance.contructor.name;

					moduleUtil.registerInstance(instance, alias, moduleUtil.options.ignoreDuplicate);
				}
			}
		}
	});

	return obj;
}

function initializeClassValue(instance, attributes, values) {
	if (typeof values != 'undefined' && values !== null && values._class) {
		return values._class;
	} else if (attributes._class) {
		return attributes._class;
	}

	return instance.constructor.name;
}

function constructor(instance, attributes, values) {
	if (!moduleUtil.options.initialized) {
		throw new InitializationException('Error, you must initialize, before you can use this module!');
	}

	if (typeof moduleUtil.options.modelRoot == 'undefined') {
		throw new InitializationException('Error, your modelRoot is missing after initialization!');
	}

	if (typeof attributes == 'undefined' || attributes === null) {
		throw new MissingAttributeException('Error, the created class has no predefined attributes!');
	}

	instance._class = initializeClassValue(instance, attributes, values);
	instance._attributes = initializeAttributes(attributes);
	instance._errors = {};

	if (!objectUtil.isValidAttributes(instance._attributes, moduleUtil.options.modelRoot)) {
		throw new InvalidTypeException('One of your predefined attribute has wrong custom type!', {
			attributes: instance._attributes
		});
	}

	update(instance, values);
}

function update(instance, values) {
	if (typeof values == 'undefined' || values === null) {
		return instance;
	}

	for (let attrName of Object.keys(instance._attributes)) {
		let attrObject = instance._attributes[attrName],
			attrValue = values[attrName],
			isCustom = objectUtil.isCustom(attrObject.type),
			isArray = attrObject.type.indexOf('[]') !== -1;

		if (typeof attrValue == 'undefined') {
			continue;
		}

		let attrType = attrObject.type.replace('[]', '');

		if (isCustom) { // Custom object
			let CustomModel = objectUtil.loadCustomModel(attrType, moduleUtil.options.modelRoot);

			if (isArray) {
				if (typeof instance[attrName] == 'undefined' || attrValue === null) {
					attrValue = attrValue === null ? [] : attrValue;
				}

				if (!objectUtil.isArray(attrValue)) {
					throw new InvalidTypeException('Wrong value type!', {
						attribute: attrName,
						value: attrValue
					});
				}

				instance[attrName] = [];

				for (let subValue of attrValue) {
					if (typeof CustomModel == typeof subValue) {
						instance[attrName].push(subValue);
					} else if (objectUtil.isObject(subValue)) {
						instance[attrName].push(new CustomModel(subValue));
					} else {
						throw new InvalidTypeException('Wrong value type!', {
							attribute: attrName,
							value: attrValue
						});
					}
				}
			} else if (typeof CustomModel == typeof attrValue) {
				instance[attrName] = attrValue;
			} else if (objectUtil.isObject(attrValue) || attrValue === null) {
				instance[attrName] = new CustomModel(attrValue);
			} else {
				throw new InvalidTypeException('Wrong value type!', {
					attribute: attrName,
					value: attrValue
				});
			}
		} else if (isArray) { // Simple object, array
			if (typeof instance[attrName] == 'undefined' || attrValue === null) {
				attrValue = attrValue === null ? [] : attrValue;
			}

			if (!objectUtil.isArray(attrValue)) {
				throw new InvalidTypeException('Wrong value type!', {
					attribute: attrName,
					value: attrValue
				});
			}

			instance[attrName] = [];

			for (let subValue of attrValue) {
				if (objectUtil.isValidValueType(subValue, attrType)) {
					instance[attrName].push(subValue);
				} else {
					throw new InvalidTypeException('Wrong value type!', {
						attribute: attrName,
						value: attrValue
					});
				}
			}
		} else if (objectUtil.isValidValueType(attrValue, attrType)) { // Simple object, single
			instance[attrName] = attrValue;
		} else {
			throw new InvalidTypeException('Wrong value type!', {
				attribute: attrName,
				value: attrValue
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
				return objectUtil.isCustom(attrObject.type) ? element.values : element;
			});
		} else {
			values[key] = typeof value != 'undefined' && objectUtil.isCustom(attrObject.type) ? instance[key].values : instance[key];
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
	if (typeof other == 'undefined' || other === null || typeof instance != typeof other || instance._class !== other._class) {
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

		let attrType = instance._attributes[attribute].type,
			isArray = attrType.indexOf('[]') !== -1,
			isCustom = objectUtil.isCustom(attrType);

		if (isArray) {
			let newValues = instance[attribute].map(function(el) {
				return isCustom ? el.clone() : el;
			});

			values[attribute] = newValues;
		} else if (isCustom) {
			values[attribute] = instance[attribute].clone();
		} else {
			values[attribute] = instance[attribute];
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