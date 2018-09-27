'use strict';

const primitives = [ String, Number, Boolean, Object ];

function isObject(value) {
	return typeof value === typeof {};
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

function isPrimitive(attrType) {
	return primitives.indexOf(attrType) !== -1;
}

function isArray(value) {
	return typeof value != 'undefined' && value.constructor === Array;
}

function isFunction(value) {
	return !!(value && value.constructor && value.call && value.apply);
}

function instanceOf(value, type) {
	if (value === null) {
		return true;
	}

	switch (type) {
		case String:
			return isString(value);
		case Number:
			return isNumber(value);
		case Boolean:
			return isBoolean(value);
		case Object:
			return isObject(value);
		default:
			return value instanceof type;
	}
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

module.exports = {
	isObject: isObject,
	isString: isString,
	isNumber: isNumber,
	isBoolean: isBoolean,
	isPrimitive: isPrimitive,
	isArray: isArray,
	isFunction: isFunction,
	instanceOf: instanceOf,
	isEquals: isEquals
};