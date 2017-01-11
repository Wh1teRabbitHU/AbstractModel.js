'use strict';

var objectUtil           = require('./object-util'),
	InvalidTypeException = require('../exceptions/invalid-type-exception'),
	ValidationException  = require('../exceptions/validation-exception');

const validationRules = [ 'min', 'max', 'length', 'required', 'values', 'regexp', 'custom' ];

function validate(attr, value, mode) {
	if (!objectUtil.isObject(attr)) {
		return [];
	}

	let isStrict = mode === 'strict',
		errors = [];

	for (let rule of validationRules) {
		if (typeof attr[rule] == 'undefined') {
			continue;
		}

		switch (rule) {
			case 'min':
				if (typeof value == 'undefined' || value === null) {
					continue;
				}

				if (!objectUtil.isNumber(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Min\'', {
						value: value
					});
				}

				if (value < attr[rule]) {
					if (isStrict) {
						throw new ValidationException('Error, the given value is less than ' + attr[rule], {
							rule: { type: rule, value: attr[rule] },
							value: value
						});
					}

					errors.push('min');
				}
				break;
			case 'max':
				if (typeof value == 'undefined' || value === null) {
					continue;
				}

				if (!objectUtil.isNumber(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Max\'', {
						value: value
					});
				}

				if (value > attr[rule]) {
					if (isStrict) {
						throw new ValidationException('Error, the given value is greater than ' + attr[rule], {
							rule: { type: rule, value: attr[rule] },
							value: value
						});
					}

					errors.push('max');
				}
				break;
			case 'length':
				if (typeof value == 'undefined' || value === null) {
					continue;
				}

				if (!objectUtil.isString(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Length\'', {
						value: value
					});
				}

				if (value.length > attr[rule]) {
					if (isStrict) {
						throw new ValidationException('Error, the given string length is greater than ' + attr[rule], {
							rule: { type: rule, value: attr[rule] },
							value: value
						});
					}

					errors.push('length');
				}
				break;
			case 'required':
				if (typeof value == 'undefined' || value === null) {
					if (isStrict) {
						throw new ValidationException('Error, the \'' + attr.name + '\' is required!');
					}

					errors.push('required');
				}
				break;
			case 'values':
				if (typeof value == 'undefined' || value === null) {
					continue;
				}

				if (!objectUtil.isArray(attr[rule])) {
					throw new InvalidTypeException('Wrong rule item type, \'values\' has to be an array!', {
						attributeRule: attr[rule]
					});
				}

				if (attr[rule].some(function(ruleValue) {
					return typeof ruleValue != typeof value;
				})) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Values\'', {
						value: value
					});
				}

				if (attr[rule].indexOf(value) === -1) {
					if (isStrict) {
						throw new ValidationException('Error, the given value is not found in the allowed values list', {
							rule: { type: rule, value: attr[rule] },
							value: value
						});
					}

					errors.push('values');
				}
				break;
			case 'regexp':
				if (typeof value == 'undefined' || value === null) {
					continue;
				}

				if (!objectUtil.isString(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'RegExp\'', {
						value: value
					});
				}

				if (!value.match(new RegExp(attr[rule]))) {
					if (isStrict) {
						throw new ValidationException('Error, the given value is not matching with the regexp pattern', {
							rule: { type: rule, value: attr[rule] },
							value: value
						});
					}

					errors.push('regexp');
				}
				break;
			case 'custom':
				if (typeof value == 'undefined' || value === null) {
					continue;
				}

				if (!objectUtil.isFunction(attr[rule])) {
					throw new InvalidTypeException('Wrong rule item type, \'custom\' has to be a function!', {
						attributeRule: attr[rule]
					});
				}

				if (!attr[rule](value)) {
					if (isStrict) {
						throw new ValidationException('Error, the given value is not passed the custom rule\'s validation', {
							rule: { type: rule, value: attr[rule] },
							value: value
						});
					}

					errors.push('custom');
				}
				break;
			default:
				throw new ValidationException('Unknown rule', {
					rule: { type: rule, value: attr[rule] }
				});
		}
	}

	return errors;
}

module.exports = {
	validate: validate
};