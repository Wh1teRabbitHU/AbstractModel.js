'use strict';

var path                       = require('path'),
	objectUtil                 = require('./object-util'),
	modelUtil                  = require('./model-util'),
	InvalidTypeException       = require('../exceptions/invalid-type-exception'),
	MissingAttributeException  = require('../exceptions/missing-attribute-exception');

const DEFAULT_OPTIONS = {
	validatonMode: 'normal',
	ignoreDuplicate: true,
	scanForModels: false,
	scanRecursively: false,
	onlyRegisterNames: false,
	initialized: false
};

var options = {};

function getOptionValue(_options, key) {
	if (typeof _options[key] == 'undefined') {
		return DEFAULT_OPTIONS[key];
	}

	return _options[key];
}

function init(_options) {
	options.modelRoot = path.resolve(_options.modelRoot);
	options.initialized = true;

	options.validatonMode = getOptionValue(_options, 'validatonMode');
	options.scanForModels = getOptionValue(_options, 'scanForModels');
	options.scanRecursively = getOptionValue(_options, 'scanRecursively');
	options.ignoreDuplicate = getOptionValue(_options, 'ignoreDuplicate');
	options.onlyRegisterNames = getOptionValue(_options, 'onlyRegisterNames');

	modelUtil.dropRegisteredInstances();

	if (options.scanForModels) {
		modelUtil.registerFolder(options.modelRoot, options.scanRecursively, options.ignoreDuplicate, options.onlyRegisterNames);
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

function registerInstance(instance, alias, ignoreDuplicate) {
	if (typeof alias == 'undefined') {
		alias = instance.name;
	}

	if (typeof ignoreDuplicate == 'undefined') {
		ignoreDuplicate = getOptionValue(options, 'ignoreDuplicate');
	}

	modelUtil.registerInstance(instance, alias, ignoreDuplicate);
}

function registerFolder(rootFolder, scanRecursively, ignoreDuplicate, onlyRegisterNames) {
	if (typeof scanRecursively == 'undefined') {
		scanRecursively = getOptionValue(options, 'scanRecursively');
	}

	if (typeof ignoreDuplicate == 'undefined') {
		ignoreDuplicate = getOptionValue(options, 'ignoreDuplicate');
	}

	if (typeof onlyRegisterNames == 'undefined') {
		onlyRegisterNames = getOptionValue(options, 'onlyRegisterNames');
	}

	modelUtil.registerFolder(rootFolder, scanRecursively, ignoreDuplicate, onlyRegisterNames);
}

module.exports = {
	init: init,
	parse: parse,
	registerInstance: registerInstance,
	registerFolder: registerFolder,
	isInstanceRegistered: modelUtil.isInstanceRegistered,
	getInstance: modelUtil.getInstance,
	options: options
};