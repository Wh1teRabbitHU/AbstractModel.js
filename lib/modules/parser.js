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

	let Clazz;

	if (typeof clazz == 'undefined') {
		if (objectUtil.isString(obj._class)) {
			Clazz = registeredInstances[obj._class];
		} else if (objectUtil.isFunction(obj._class)) {
			Clazz = obj._class;
		} else {
			throw new InvalidTypeException('The given \'_class\' attribute invalid! You must provide an alias or an extension of the AbstractModel', obj);
		}
	} else if (objectUtil.isString(clazz)) {
		Clazz = registeredInstances[clazz];
	} else if (objectUtil.isFunction(clazz)) {
		Clazz = clazz;
	} else {
		throw new InvalidTypeException('The given argument is invalid! You must provide an alias or an extension of the AbstractModel', obj);
	}

	return new Clazz(obj);
}

function isClassRegistered(alias) {
	if (typeof alias == 'undefined') {
		throw new MissingAttributeException('You must give an alias or a class to check if its registered!');
	}

	if (objectUtil.isString(alias)) {
		return typeof registeredInstances[alias] != 'undefined';
	}

	if (objectUtil.isFunction(alias) && typeof alias.name != 'undefined') {
		return typeof registeredInstances[alias.name] != 'undefined';
	}

	throw new InvalidTypeException('Only an alias or a class are allowed as input parameter!');
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