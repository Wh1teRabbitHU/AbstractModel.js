'use strict';

var model = require('../../lib/abstract-model');

const attributes = {
	name: {
		type: String,
		required: true
	},
	age: Number,
	sex: {
		type: String,
		values: [ 'Male', 'Female' ]
	}
};

class StoreKeeper extends model.Class {

	constructor(values) {
		super(attributes, values);
	}
}

module.exports = StoreKeeper;