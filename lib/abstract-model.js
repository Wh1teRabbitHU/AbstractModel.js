'use strict';

var path                 = require('path'),
	InvalidTypeException = require('./exceptions/invalid-type-exception');

const types = [ 'String', 'Number', 'Boolean', 'Object' ];

var modelRoot;

function isObject(obj) {
	return obj === Object(obj);
}

function isValidValueType(value, type) {
	if (value === null) {
		return true;
	}

	switch (type) {
		case 'String':
			return typeof value == typeof '';
		case 'Number':
			return !isNaN(value);
		case 'Boolean':
			return value === true || value === false;
		case 'Object':
			return isObject(value);
		default:
			return false;
	}
}

class AbstractModel {

	constructor(attributes, values) {
		this._attributes = attributes;

		this.update(values);
	}

	update(values) {
		for (let attrName of Object.keys(this._attributes)) {
			if (typeof values[attrName] == 'undefined') {
				continue;
			}

			let attrType = this._attributes[attrName],
				isCustom = types.indexOf(attrType.replace('[]', '')) === -1,
				isArray = attrType.indexOf('[]') !== -1;

			attrType = attrType.replace('[]', '');

			if (isCustom) { // Custom object
				let CustomModel = require(modelRoot + '/' + attrType); // eslint-disable-line global-require

				if (isArray) {
					if (typeof this[attrName] == 'undefined') {
						this[attrName] = [];
					}

					for (let subValue of values[attrName]) {
						if (typeof vModel == typeof subValue) {
							this[attrName].push(subValue);
						} else if (isObject(subValue)) {
							this[attrName].push(new CustomModel(subValue));
						} else {
							throw new InvalidTypeException('Wrong argument type!');
						}
					}
				} else if (typeof vModel == typeof values[attrName]) {
					this[attrName] = values[attrName];
				} else if (isObject(values[attrName])) {
					this[attrName] = new CustomModel(values[attrName]);
				} else {
					throw new InvalidTypeException('Wrong argument type!');
				}
			} else if (isArray) { // Simple object, array
				if (typeof this[attrName] == 'undefined') {
					this[attrName] = [];
				}

				for (let subValue of values[attrName]) {
					if (isValidValueType(subValue, attrType)) {
						this[attrName].push(subValue);
					} else {
						throw new InvalidTypeException('Wrong argument type!');
					}
				}
			} else if (isValidValueType(values[attrName], attrType)) { // Simple object, single
				this[attrName] = values[attrName];
			} else {
				throw new InvalidTypeException('Wrong argument type!');
			}
		}
	}
}

module.exports = {
	init: function(_root) {
		modelRoot = path.relative(__dirname, _root);
	},
	Class: AbstractModel
};