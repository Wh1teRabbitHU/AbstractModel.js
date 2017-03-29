'use strict';

var fileUtil                   = require('./file-util'),
	AlreadyRegisteredException = require('../exceptions/already-registered-exception');

var registeredModels = {};

function registerModel(instance, alias) {
	if (typeof registeredModels[alias] != 'undefined') {
		throw new AlreadyRegisteredException('The given alias has already taken by an other registered model instance!', {
			alias: alias
		});
	}

	registeredModels[alias] = instance;
}

function registerFolder(rootFolder, recursively) {
	let modules = fileUtil.getAllModulesFromFolder(rootFolder, recursively);

	for (let moduleName in modules) {
		registerModel(moduleName, modules[moduleName]);
	}
}

function isModelRegistered(modelPath) {
	return typeof registeredModels[modelPath] != 'undefined';
}

function getInstance(modelPath) {
	return registeredModels[modelPath];
}

module.exports = {
	registerModel: registerModel,
	registerFolder: registerFolder,
	isModelRegistered: isModelRegistered,
	getInstance: getInstance
};