'use strict';

const types = [ 'String', 'Number', 'Boolean', 'Object' ];

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

module.exports = {
	isObject: isObject,
	isString: isString,
	isNumber: isNumber,
	isBoolean: isBoolean,
	isCustom: isCustom,
	isValidValueType: isValidValueType
};