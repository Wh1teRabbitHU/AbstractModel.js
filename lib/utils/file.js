'use strict';

const EXTENSION = '.js';

var walk = require('walk'),
	path = require('path'),
	fs   = require('fs');

function toUpperCammelCase(name) {
	return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter) {
		return letter.toUpperCase();
	}).replace(/\s+/g, '').replace(/\-/g, '');
}

function getModuleAlias(rootPath, modulePath) {
	if (!rootPath.endsWith('/')) {
		rootPath += '/';
	}

	let alias = modulePath.replace(rootPath, ''),
		moduleName = path.basename(alias);

	return alias.substring(0, alias.length - moduleName.length) + toUpperCammelCase(moduleName);
}

function getModulePath(root, moduleName) {
	return path.resolve(__dirname, path.join(root, moduleName));
}

function walkInSubfolders(rootPath) {
	let models = {};

	walk.walkSync(rootPath, {
		followLinks: false,
		listeners: {
			file: (currentRoot, fileStat, next) => {
				if (!fileStat.name.endsWith(EXTENSION)) {
					next();

					return;
				}

				var moduleName = path.basename(fileStat.name, EXTENSION),
					modulePath = getModulePath(currentRoot, moduleName),
					moduleAlias = getModuleAlias(rootPath, modulePath);

				if (typeof models[moduleAlias] == 'undefined') {
					models[moduleAlias] = require(modulePath); // eslint-disable-line global-require
				}

				next();
			}
		}
	});

	return models;
}

function walkThisFolder(rootPath) {
	let models = {};

	fs.readdirSync(rootPath).forEach((file) => {
		if (!fs.lstatSync(path.join(rootPath, file)).isDirectory()) {
			var moduleName = path.basename(file, EXTENSION),
				modulePath = getModulePath(rootPath, moduleName);

			if (typeof models[toUpperCammelCase(moduleName)] == 'undefined') {
				models[toUpperCammelCase(moduleName)] = require(modulePath); // eslint-disable-line global-require
			}
		}
	});

	return models;
}

function getAllModulesFromFolder(folderPath, recursively) {
	return recursively ? walkInSubfolders(folderPath) : walkThisFolder(folderPath);
}

module.exports = {
	getAllModulesFromFolder: getAllModulesFromFolder
};