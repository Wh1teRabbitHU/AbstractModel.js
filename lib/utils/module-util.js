'use strict';

var path                       = require('path'),
	objectUtil                 = require('./object-util'),
	modelUtil                  = require('./model-util'),
	InvalidTypeException       = require('../exceptions/invalid-type-exception'),
	MissingAttributeException  = require('../exceptions/missing-attribute-exception');

const DEFAULT_OPTIONS = {
	validatonMode: 'normal',
	scanForModels: false,
	scanRecursively: false,
	initialized: false
};

var options = {};

function init(_options) {
	options.modelRoot = path.resolve(_options.modelRoot);
	options.initialized = true;

	options.validatonMode = _options.validatonMode || DEFAULT_OPTIONS.validationMode;
	options.scanForModels = _options.scanForModels || DEFAULT_OPTIONS.scanForModels;
	options.scanRecursively = _options.scanRecursively || DEFAULT_OPTIONS.scanRecursively;

	if (options.scanForModels) {
		modelUtil.scanFolderAndRegisterModels(options.modelRoot, options.scanRecursively);
	}
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