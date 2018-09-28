'use strict';

const moduleUtil     = require('../utils/module');
const validationUtil = require('../utils/validation');

function validate(instance, mode) {
	let values = instance.values;

	mode = mode || moduleUtil.options.validatonMode;

	instance._errors = {};

	Object.keys(values).forEach(function(key) {
		let errors = validationUtil.validate(instance._attributes[key], values[key], mode);

		if (errors.length > 0) {
			instance._errors[key] = errors;
		}
	});

	return instance._errors;
}

module.exports = validate;