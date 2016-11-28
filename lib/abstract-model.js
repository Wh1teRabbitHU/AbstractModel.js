'use strict';

var path                      = require('path'),
	objectUtil                = require('./utils/object-util'),
	validationUtil            = require('./utils/validation-util'),
	InitializationException   = require('./exceptions/initialization-exception'),
	InvalidTypeException      = require('./exceptions/invalid-type-exception'),
	MissingAttributeException = require('./exceptions/missing-attribute-exception');

var initialized = false;

var modelRoot;

function loadCustomModel(name) {
	if (typeof modelRoot == 'undefined') {
		throw new InitializationException();
	}

	return require(modelRoot + '/' + name); // eslint-disable-line global-require
}

function removeInnerAttributes(attributes) {
	let obj = {};

	Object.keys(attributes).forEach((key) => {
		if (!key.startsWith('_')) {
			obj[key] = attributes[key];
		}
	});

	return obj;
}

function getAttrType(attr) {
	return objectUtil.isObject(attr) ? attr.type : attr;
}

function getAttrValue(name, values) {
	return values[name];
}

class AbstractModel {

	constructor(attributes, values) {
		if (!initialized) {
			throw new InitializationException('Error, you must initialize, before you can use this module!');
		}

		if (typeof attributes._class == 'undefined') {
			throw new MissingAttributeException('Error, the \'_class\' attribute is missing!');
		}

		this._class = attributes._class;
		this._attributes = removeInnerAttributes(attributes);
		this._errors = {};

		if (typeof values != 'undefined') {
			this.update(values);
		}
	}

	update(values) {
		for (let attrName of Object.keys(this._attributes)) {
			let attrObject = this._attributes[attrName],
				attrValue = getAttrValue(attrName, values),
				attrType = getAttrType(attrObject),
				isCustom = objectUtil.isCustom(attrType),
				isArray = attrType.indexOf('[]') !== -1;

			if (typeof attrValue == 'undefined') {
				continue;
			}

			attrType = attrType.replace('[]', '');

			if (isCustom) { // Custom object
				let CustomModel = loadCustomModel(attrType);

				if (isArray) {
					if (typeof this[attrName] == 'undefined' || attrValue === null) {
						this[attrName] = [];

						attrValue = attrValue === null ? [] : attrValue;
					}

					for (let subValue of attrValue) {
						if (typeof CustomModel == typeof subValue) {
							this[attrName].push(subValue);
						} else if (objectUtil.isObject(subValue)) {
							this[attrName].push(new CustomModel(subValue));
						} else {
							throw new InvalidTypeException('Wrong attribute type!');
						}

						validationUtil.validate(attrObject, subValue);
					}
				} else if (typeof CustomModel == typeof attrValue) {
					this[attrName] = attrValue;

					validationUtil.validate(attrObject, attrValue);
				} else if (objectUtil.isObject(attrValue) || attrValue === null) {
					this[attrName] = new CustomModel(attrValue);

					validationUtil.validate(attrObject, attrValue);
				} else {
					throw new InvalidTypeException('Wrong attribute type!');
				}
			} else if (isArray) { // Simple object, array
				if (typeof this[attrName] == 'undefined' || attrValue === null) {
					this[attrName] = [];

					attrValue = attrValue === null ? [] : attrValue;
				}

				for (let subValue of attrValue) {
					if (objectUtil.isValidValueType(subValue, attrType)) {
						this[attrName].push(subValue);
					} else {
						throw new InvalidTypeException('Wrong attribute type!');
					}

					validationUtil.validate(attrObject, subValue);
				}
			} else if (objectUtil.isValidValueType(attrValue, attrType)) { // Simple object, single
				this[attrName] = attrValue;

				validationUtil.validate(attrObject, attrValue);
			} else {
				throw new InvalidTypeException('Wrong attribute type!');
			}
		}
	}

	get values() {
		let self = this,
			values = {};

		Object.keys(self._attributes).forEach(function(key) {
			values[key] = self[key];
		});

		return values;
	}

	set values(values) {
		let self = this;

		Object.keys(self._attributes).forEach(function(key) {
			self[key] = values[key];
		});
	}

	equals(other) {
		let self = this;

		if (typeof other == 'undefined' || typeof self != typeof other || self._class !== other._class) {
			return false;
		}

		return Object.keys(this._attributes).every(function(key) {
			return self[key] === other[key];
		});
	}
}

module.exports = {
	init: function(options) {
		modelRoot = path.relative(__dirname, options.modelRoot);

		initialized = true;
	},
	parse: function(_values) {
		if (!objectUtil.isObject(_values)) {
			throw new InvalidTypeException('Wrong argument type!');
		}

		if (typeof _values._class == 'undefined') {
			throw new MissingAttributeException('The given object doesn\'t have \'_class\' attribute!');
		}

		let CustomModel = loadCustomModel(_values._class); // eslint-disable-line global-require

		return new CustomModel(_values);
	},
	Class: AbstractModel
};