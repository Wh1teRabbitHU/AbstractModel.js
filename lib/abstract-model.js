'use strict';

const constructorMethod = require('./methods/constructor');
const updateMethod      = require('./methods/update');
const getValuesMethod   = require('./methods/get-values');
const setValuesMethod   = require('./methods/set-values');
const hasErrorsMethod   = require('./methods/has-errors');
const equalsMethod      = require('./methods/equals');
const validateMethod    = require('./methods/validate');
const cloneMethod       = require('./methods/clone');

const parserModule      = require('./modules/parser');

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
		return hasErrorsMethod(this);
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
	parseObject: parserModule.parseObject,
	registerClass: parserModule.registerClass,
	Class: AbstractModel
};