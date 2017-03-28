'use strict';

var fileUtil                   = require('./file-util'),
	AlreadyRegisteredException = require('../exceptions/already-registered-exception');

var registeredModels = {};

function registerModel(modelPath, instance) {
	if (typeof registeredModels[modelPath] != 'undefined') {
		throw new AlreadyRegisteredException('The given path has already taken by an other registered model instance!', {
			modelPath: modelPath
		});
	}

	registeredModels[modelPath] = instance;
}

function scanFolderAndRegisterModels(rootFolder, recursively) {
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
	scanFolderAndRegisterModels: scanFolderAndRegisterModels,
	isModelRegistered: isModelRegistered,
	getInstance: getInstance
};