'use strict';

var path                      = require('path'),
	objectUtil                = require('./object-util'),
	InvalidTypeException      = require('../exceptions/invalid-type-exception'),
	MissingAttributeException = require('../exceptions/missing-attribute-exception');

var options = {
	initialized: false
};

function init(_options) {
	options.modelRoot = path.resolve(_options.modelRoot);
	options.validatonMode = _options.validatonMode || 'normal';
	options.initialized = true;
}

function parse(values) {
	if (!objectUtil.isObject(values)) {
		throw new InvalidTypeException('Wrong argument type!', values);
	}

	if (typeof values._class == 'undefined') {
		throw new MissingAttributeException('The given object doesn\'t have \'_class\' attribute!', values);
	}

	let CustomModel = objectUtil.loadCustomModel(values._class, options.modelRoot); // eslint-disable-line global-require

	return new CustomModel(values);
}

module.exports = {
	init: init,
	parse: parse,
	options: options
};