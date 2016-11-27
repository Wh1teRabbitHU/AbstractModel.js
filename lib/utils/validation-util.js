'use strict';

var objectUtil           = require('./object-util'),
	InvalidTypeException = require('../exceptions/invalid-type-exception'),
	ValidationException  = require('../exceptions/validation-exception');

const validationRules = [ 'Min', 'Max', 'Length', 'Required' ];

function validate(attr, value) {
	if (!objectUtil.isObject(attr)) {
		return;
	}

	for (let rule of validationRules) {
		if (typeof attr[rule] == 'undefined') {
			continue;
		}

		switch (rule) {
			case 'Min':
				if (!objectUtil.isNumber(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Min\'');
				}
				if (value < attr[rule]) {
					throw new ValidationException('Error, the given value is less than ' + attr[rule]);
				}
				break;
			case 'Max':
				if (!objectUtil.isNumber(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Max\'');
				}
				if (value > attr[rule]) {
					throw new ValidationException('Error, the given value is greater than ' + attr[rule]);
				}
				break;
			case 'Length':
				if (!objectUtil.isString(value)) {
					throw new InvalidTypeException('Wrong value type for this rule: \'Length\'');
				}
				if (value.length > attr[rule]) {
					throw new ValidationException('Error, the given string length is greater than ' + attr[rule]);
				}
				break;
			case 'Required':
				if (typeof value == 'undefined') {
					throw new ValidationException('Validation error, this attribute is required, but its missing');
				}
				if (typeof value == 'undefined' || value === null) {
					throw new ValidationException('Error, the \'' + attr.name + '\' is required!');
				}
				break;
			default:
				throw new ValidationException('Unknown rule');
		}
	}
}

module.exports = {
	validate: validate
};