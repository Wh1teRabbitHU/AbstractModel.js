'use strict';

var path                      = require('path'),
	objectUtil                = require('./utils/object-util'),
	validationUtil            = require('./utils/validation-util'),
	InitializationException   = require('./exceptions/initialization-exception'),
	InvalidTypeException      = require('./exceptions/invalid-type-exception'),
	MissingAttributeException = require('./exceptions/missing-attribute-exception');

var initialized = false;

var modelRoot, validatonMode;

// TODO:
//
// - modelRoot can be given as array,
// - _class should be more complex (like separate path and name)

class AbstractModel {

	constructor(attributes, values) {
		if (!initialized) {
			throw new InitializationException('Error, you must initialize, before you can use this module!');
		}

		if (typeof modelRoot == 'undefined') {
			throw new InitializationException('Error, your modelRoot is missing after initialization!');
		}

		if (typeof attributes == 'undefined' || attributes === null) {
			throw new MissingAttributeException('Error, the created class has no predefined attributes!');
		}

		this._class = values && values._class ? values._class : this.constructor.name;
		this._attributes = objectUtil.removeInnerAttributes(attributes);
		this._errors = {};

		if (!objectUtil.isValidAttributes(this._attributes, modelRoot)) {
			throw new InvalidTypeException('One of your predefined attribute has wrong custom type!', {
				attributes: this._attributes
			});
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
						throw new InvalidTypeException('Wrong value type!', {
							attribute: attrName,
							value: attrValue
						});
					}

					this[attrName] = [];

					for (let subValue of attrValue) {
						if (typeof CustomModel == typeof subValue) {
							this[attrName].push(subValue);
						} else if (objectUtil.isObject(subValue)) {
							this[attrName].push(new CustomModel(subValue));
						} else {
							throw new InvalidTypeException('Wrong value type!', {
								attribute: attrName,
								value: attrValue
							});
						}
					}
				} else if (typeof CustomModel == typeof attrValue) {
					this[attrName] = attrValue;
				} else if (objectUtil.isObject(attrValue) || attrValue === null) {
					this[attrName] = new CustomModel(attrValue);
				} else {
					throw new InvalidTypeException('Wrong value type!', {
						attribute: attrName,
						value: attrValue
					});
				}
			} else if (isArray) { // Simple object, array
				if (typeof this[attrName] == 'undefined' || attrValue === null) {
					attrValue = attrValue === null ? [] : attrValue;
				}

				if (!objectUtil.isArray(attrValue)) {
					throw new InvalidTypeException('Wrong value type!', {
						attribute: attrName,
						value: attrValue
					});
				}

				this[attrName] = [];

				for (let subValue of attrValue) {
					if (objectUtil.isValidValueType(subValue, attrType)) {
						this[attrName].push(subValue);
					} else {
						throw new InvalidTypeException('Wrong value type!', {
							attribute: attrName,
							value: attrValue
						});
					}
				}
			} else if (objectUtil.isValidValueType(attrValue, attrType)) { // Simple object, single
				this[attrName] = attrValue;
			} else {
				throw new InvalidTypeException('Wrong value type!', {
					attribute: attrName,
					value: attrValue
				});
			}
		}

		this.validate();
	}

	get values() {
		let self = this,
			values = {};

		Object.keys(self._attributes).forEach(function(key) {
			let value = self[key],
				attrObject = self._attributes[key],
				attrType = objectUtil.isObject(attrObject) ? attrObject.type : attrObject;

			if (objectUtil.isArray(value)) {
				values[key] = value.map(function(element) {
					return objectUtil.isCustom(attrType) ? element.values : element;
				});
			} else {
				values[key] = typeof value != 'undefined' && objectUtil.isCustom(attrType) ? self[key].values : self[key];
			}
		});

		return values;
	}

	set values(values) {
		let self = this;

		Object.keys(self._attributes).forEach(function(key) {
			if (typeof values[key] == 'undefined') {
				self[key] = values[key];
			}
		});

		self.update(values);
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

	validate(mode) {
		let self = this,
			values = self.values;

		mode = mode || validatonMode;

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
		validatonMode = options.validatonMode || 'normal';

		initialized = true;
	},
	parse: function(_values) {
		if (!objectUtil.isObject(_values)) {
			throw new InvalidTypeException('Wrong argument type!', _values);
		}

		if (typeof _values._class == 'undefined') {
			throw new MissingAttributeException('The given object doesn\'t have \'_class\' attribute!', _values);
		}

		let CustomModel = objectUtil.loadCustomModel(_values._class, modelRoot); // eslint-disable-line global-require

		return new CustomModel(_values);
	},
	Class: AbstractModel
};