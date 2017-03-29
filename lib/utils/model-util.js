'use strict';

var fileUtil                   = require('./file-util'),
	AlreadyRegisteredException = require('../exceptions/already-registered-exception');

var registeredInstances = {};

function dropRegisteredInstances() {
	registeredInstances = {};
}

function registerInstance(instance, alias, ignoreDuplicate) {
	if (typeof registeredInstances[alias] != 'undefined' && !ignoreDuplicate) {
		throw new AlreadyRegisteredException('The given alias has already taken by an other registered model instance!', {
			alias: alias
		});
	}

	registeredInstances[alias] = instance;
}

function registerFolder(rootFolder, recursively, ignoreDuplicate) {
	let modules = fileUtil.getAllModulesFromFolder(rootFolder, recursively);

	for (let moduleName in modules) {
		registerInstance(modules[moduleName], moduleName, ignoreDuplicate);
	}
}

function isInstanceRegistered(alias) {
	return typeof registeredInstances[alias] != 'undefined';
}

function getInstance(alias) {
	return registeredInstances[alias];
}

module.exports = {
	dropRegisteredInstances: dropRegisteredInstances,
	registerInstance: registerInstance,
	registerFolder: registerFolder,
	isInstanceRegistered: isInstanceRegistered,
	getInstance: getInstance
};