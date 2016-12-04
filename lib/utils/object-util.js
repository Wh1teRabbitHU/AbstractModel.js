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
	var allAttributeValid = typeof attributes != 'undefined' && attributes !== null;

	Object.keys(attributes).forEach(function(key) {
		let attrObject = attributes[key],
			attrType = isObject(attrObject) ? attrObject.type : attrObject;

		attrType = attrType.replace('[]', '');

		if (isCustom(attrType) && !fs.existsSync(modelRoot + '/' + toLowerCammelCase(attrType) + '.' + jsFileExtension)) {
			allAttributeValid = false;
		}
	});

	return allAttributeValid;
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
	isValidValueType: isValidValueType,
	isValidAttributes: isValidAttributes,
	loadCustomModel: loadCustomModel
};