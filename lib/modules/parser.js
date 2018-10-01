'use strict';

const objectUtil                 = require('../utils/object');

const InvalidTypeException       = require('../exceptions/invalid-type-exception');
const MissingAttributeException  = require('../exceptions/missing-attribute-exception');
const AlreadyRegisteredException = require('../exceptions/already-registered-exception');

var registeredInstances = {};

function registerClass(clazz, alias, ignoreDuplicate = false) {
	if (typeof alias == 'undefined') {
		alias = clazz.name;
	}

	if (typeof registeredInstances[alias] != 'undefined' && !ignoreDuplicate) {
		throw new AlreadyRegisteredException('The given alias has already taken by an other registered model instance!', {
			alias: alias
		});
	}

	registeredInstances[alias] = clazz;
}

function parseObject(obj, clazz) {
	if (!objectUtil.isObject(obj)) {
		throw new InvalidTypeException('Wrong argument type!', obj);
	}

	if (typeof clazz == 'undefined' && typeof obj._class == 'undefined') {
		throw new MissingAttributeException('The given object doesn\'t have \'_class\' attribute nor the parser function get a class object!', obj);
	}

	let Clazz = clazz || registeredInstances[obj._class];

	return new Clazz(obj);
}

function isClassRegistered(alias) {
	return typeof registeredInstances[alias] != 'undefined';
}

function dropRegisteredClasses() {
	registeredInstances = {};
}

module.exports = {
	registerClass: registerClass,
	parseObject: parseObject,
	isClassRegistered: isClassRegistered,
	dropRegisteredClasses: dropRegisteredClasses
};