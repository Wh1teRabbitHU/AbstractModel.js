'use strict';

var model = require('../../lib/abstract-model');

const attributes = {
	name: {
		type: 'String',
		required: true
	},
	books: 'Book[]',
	workers: 'StoreKeeper[]',
	owner: 'StoreKeeper'
};

class Store extends model.Class {

	constructor(values) {
		super(attributes, values);
	}
}

module.exports = Store;