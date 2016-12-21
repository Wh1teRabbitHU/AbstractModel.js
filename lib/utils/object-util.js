'use strict';

var fs   = require('fs');

const jsFileExtension = 'js';
const types = [ 'String', 'Number', 'Boolean', 'Object' ];

function toLowerCammelCase(name) {
	return name.replace(/(?:^|\.?)([A-Z])/g, function(x, y) {
		return '-' + y.toLowerCase();
	}).replace(/^-/, '');
}

function isObject(value) {
	return value === Object(value);
}

function isString(value) {
	return typeof value == typeof '';
}

function isNumber(value) {
	return !isNaN(value);
}

function isBoolean(value) {
	return value === true || value === false;
}

function isCustom(attrType) {
	return types.indexOf(attrType.replace('[]', '')) === -1;
}

function isArray(value) {
	return value.constructor === Array;
}

function isFunction(value) {
	return !!(value && value.constructor && value.call && value.apply);
}

function isValidValueType(value, type) {
	if (value === null) {
		return true;
	}

	switch (type) {
		case 'String':
			return isString(value);
		case 'Number':
			return isNumber(value);
		case 'Boolean':
			return isBoolean(value);
		case 'Object':
			return isObject(value);
		default:
			return false;
	}
}

function isValidAttributes(attributes, modelRoot) {
	var allAttributesAreValid = typeof attributes != 'undefined' && attributes !== null;

	Object.keys(attributes).forEach(function(key) {
		let attrObject = attributes[key],
			attrType = isObject(attrObject) ? attrObject.type : attrObject;

		attrType = attrType.replace('[]', '');

		if (isCustom(attrType) && !fs.existsSync(modelRoot + '/' + toLowerCammelCase(attrType) + '.' + jsFileExtension)) {
			allAttributesAreValid = false;
		}
	});

	return allAttributesAreValid;
}

function isEquals(valueA, valueB) {
	if (typeof valueA == 'undefined' && typeof valueB == 'undefined') {
		return true;
	}

	if (valueA === null || valueB === null) {
		return valueA === null && valueB === null;
	}

	if (typeof valueA != typeof valueB) {
		return false;
	}

	if (isString(valueA) || isNumber(valueA) || isBoolean(valueA)) {
		return valueA === valueB;
	}

	if (isArray(valueA)) {
		let countA = valueA.length,
			countB = valueB.length;

		if (!isEquals(countA, countB)) {
			return false;
		}

		valueA.sort();
		valueB.sort();

		var result = true;

		for (var i = 0; i < valueA.length; ++i) {
			if (!isEquals(valueA[i], valueB[i])) {
				result = false;
			}
		}

		return result;
	}

	// Custom type, probably inherited by our abstract model
	if (typeof valueA.equals != 'undefined') {
		return valueA.equals(valueB);
	}

	if (isObject(valueA)) {
		let countA = Object.keys(valueA).length,
			countB = Object.keys(valueB).length;

		return isEquals(countA, countB) && Object.keys(valueA).every(function(key) {
			return isEquals(valueA[key], valueB[key]);
		});
	}

	return valueA === valueB;
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

function loadCustomModel(name, modelRoot) {
	return require(modelRoot + '/' + toLowerCammelCase(name)); // eslint-disable-line global-require
}

module.exports = {
	isObject: isObject,
	isString: isString,
	isNumber: isNumber,
	isBoolean: isBoolean,
	isCustom: isCustom,
	isArray: isArray,
	isFunction: isFunction,
	isValidValueType: isValidValueType,
	isValidAttributes: isValidAttributes,
	isEquals: isEquals,
	removeInnerAttributes: removeInnerAttributes,
	loadCustomModel: loadCustomModel
};