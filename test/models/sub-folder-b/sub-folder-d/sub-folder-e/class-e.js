'use strict';

var model = require('../../../../../lib/abstract-model');

const attributes = {
	name: 'String',
	value: 'String'
};

class ClassE extends model.Class {

	constructor(values) {
		super(attributes, values);
	}
}

module.exports = ClassE;