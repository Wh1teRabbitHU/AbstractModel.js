'use strict';

const EXTENSION = '.js';

var walk = require('walk'),
	path = require('path'),
	fs   = require('fs');

function getModuleAlias(rootPath, modulePath) {
	if (!rootPath.endsWith('/')) {
		rootPath += '/';
	}

	return modulePath.replace(rootPath, '');
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

			if (typeof models[moduleName] == 'undefined') {
				models[moduleName] = require(modulePath); // eslint-disable-line global-require
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