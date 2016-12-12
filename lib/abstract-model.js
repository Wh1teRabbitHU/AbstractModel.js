'use strict';

var path                      = require('path'),
	objectUtil                = require('./utils/object-util'),
	validationUtil            = require('./utils/validation-util'),
	InitializationException   = require('./exceptions/initialization-exception'),
	InvalidTypeException      = require('./exceptions/invalid-type-exception'),
	MissingAttributeException = require('./exceptions/missing-attribute-exception');

var initialized = false;

var modelRoot, validator;

// TODO: Adding the '_class' attribute manualy, full path for '_class'

class AbstractModel {

	constructor(attributes, values) {
		if (!initialized) {
			throw new InitializationException('Error, you must initialize, before you can use this module!');
		}

		if (typeof modelRoot == 'undefined') {
			throw new InitializationException();
		}

		if (typeof attributes == 'undefined' || attributes === null) {
			throw new MissingAttributeException('Error, the created class has no predefined attributes!');
		}

		this._class = this.constructor.name;
		this._attributes = objectUtil.removeInnerAttributes(attributes);
		this._errors = {};

		if (!objectUtil.isValidAttributes(this._attributes, modelRoot)) {
			throw new InvalidTypeException('Wrong attribute type!');
		}

		if (typeof values != 'undefined') {
			this.update(values);
		}
	}

	update(values) {
		for (let attrName of Object.keys(this._attributes)) {
			let attrObject = this._attributes[attrName],
				attrValue = values[attrName],
				attrType = objectUtil.isObject(attrObject) ? attrObject.type : attrObject,
				isCustom = objectUtil.isCustom(attrType),
				isArray = attrType.indexOf('[]') !== -1;

			if (typeof attrValue == 'undefined') {
				continue;
			}

			attrType = attrType.replace('[]', '');

			if (isCustom) { // Custom object
				let CustomModel = objectUtil.loadCustomModel(attrType, modelRoot);

				if (isArray) {
					if (typeof this[attrName] == 'undefined' || attrValue === null) {
						attrValue = attrValue === null ? [] : attrValue;
					}

					if (!objectUtil.isArray(attrValue)) {
						throw new InvalidTypeException('Wrong value type!');
					}

					this[attrName] = [];

					for (let subValue of attrValue) {
						if (typeof CustomModel == typeof subValue) {
							this[attrName].push(subValue);
						} else if (objectUtil.isObject(subValue)) {
							this[attrName].push(new CustomModel(subValue));
						} else {
							throw new InvalidTypeException('Wrong value type!');
						}
					}
				} else if (typeof CustomModel == typeof attrValue) {
					this[attrName] = attrValue;
				} else if (objectUtil.isObject(attrValue) || attrValue === null) {
					this[attrName] = new CustomModel(attrValue);
				} else {
					throw new InvalidTypeException('Wrong value type!');
				}
			} else if (isArray) { // Simple object, array
				if (typeof this[attrName] == 'undefined' || attrValue === null) {
					attrValue = attrValue === null ? [] : attrValue;
				}

				if (!objectUtil.isArray(attrValue)) {
					throw new InvalidTypeException('Wrong value type!');
				}

				this[attrName] = [];

				for (let subValue of attrValue) {
					if (objectUtil.isValidValueType(subValue, attrType)) {
						this[attrName].push(subValue);
					} else {
						throw new InvalidTypeException('Wrong value type!');
					}
				}
			} else if (objectUtil.isValidValueType(attrValue, attrType)) { // Simple object, single
				this[attrName] = attrValue;
			} else {
				throw new InvalidTypeException('Wrong value type!');
			}
		}

		this.validate();
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

	get hasErrors() {
		return Object.keys(this.validate('normal')).length > 0;
	}

	equals(other) {
		let self = this;

		if (typeof other == 'undefined' || other === null || typeof self != typeof other || self._class !== other._class) {
			return false;
		}

		return Object.keys(this._attributes).every(function(key) {
			return objectUtil.isEquals(self[key], other[key]);
		});
	}

	validate(validatorMode) {
		let self = this,
			mode = validatorMode || validator,
			values = self.values;

		self._errors = {};

		Object.keys(values).forEach(function(key) {
			let errors = validationUtil.validate(self._attributes[key], values[key], mode);

			if (errors.length > 0) {
				self._errors[key] = errors;
			}
		});

		return self._errors;
	}
}

module.exports = {
	init: function(options) {
		modelRoot = path.resolve(options.modelRoot);
		validator = options.validator || 'normal';

		initialized = true;
	},
	parse: function(_values) {
		if (!objectUtil.isObject(_values)) {
			throw new InvalidTypeException('Wrong argument type!');
		}

		if (typeof _values._class == 'undefined') {
			throw new MissingAttributeException('The given object doesn\'t have \'_class\' attribute!');
		}

		let CustomModel = objectUtil.loadCustomModel(_values._class, modelRoot); // eslint-disable-line global-require

		return new CustomModel(_values);
	},
	Class: AbstractModel
};