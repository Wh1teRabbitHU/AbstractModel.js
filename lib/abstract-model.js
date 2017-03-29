'use strict';

var moduleUtil = require('./utils/module-util'),
	classUtil  = require('./utils/class-util');

// TODO:
//
// - two class has the same prototype
// - _class should be more complex (like separate path and name)
// - modelRoot can be given as array,

class AbstractModel {

	constructor(attributes, values) {
		classUtil.constructor(this, attributes, values);
	}

	update(values) {
		return classUtil.update(this, values);
	}

	get values() {
		return classUtil.getValues(this);
	}

	set values(values) {
		classUtil.setValues(this, values);
	}

	get hasErrors() {
		return Object.keys(this.validate('normal')).length > 0;
	}

	equals(other) {
		return classUtil.equals(this, other);
	}

	validate(mode) {
		return classUtil.validate(this, mode);
	}

	clone() {
		return classUtil.clone(this);
	}
}

module.exports = {
	init: moduleUtil.init,
	parse: moduleUtil.parse,
	registerInstance: moduleUtil.registerInstance,
	registerFolder: moduleUtil.registerFolder,
	Class: AbstractModel
};