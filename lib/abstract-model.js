'use strict';

const constructorMethod = require('./methods/constructor');
const updateMethod      = require('./methods/update');
const getValuesMethod   = require('./methods/get-values');
const setValuesMethod   = require('./methods/set-values');
const equalsMethod      = require('./methods/equals');
const validateMethod    = require('./methods/validate');
const cloneMethod       = require('./methods/clone');

const moduleUtil = require('./utils/module');

// TODO:
//
// - two class has the same prototype
// - _class should be more complex (like separate path and name)
// - modelRoot can be given as array,

class AbstractModel {

	constructor(attributes, values) {
		constructorMethod(this, attributes, values);
	}

	update(values) {
		return updateMethod(this, values);
	}

	get values() {
		return getValuesMethod(this);
	}

	set values(values) {
		setValuesMethod(this, values);
	}

	get hasErrors() {
		return Object.keys(this.validate('normal')).length > 0;
	}

	equals(other) {
		return equalsMethod(this, other);
	}

	validate(mode) {
		return validateMethod(this, mode);
	}

	clone() {
		return cloneMethod(this);
	}
}

module.exports = {
	init: moduleUtil.init,
	parse: moduleUtil.parse,
	registerInstance: moduleUtil.registerInstance,
	registerFolder: moduleUtil.registerFolder,
	isInstanceRegistered: moduleUtil.isInstanceRegistered,
	getInstance: moduleUtil.getInstance,
	Class: AbstractModel
};