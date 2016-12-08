'use strict';

var model = require('../../lib/abstract-model');

const attributes = {
	name: 'String',
	owner: 'String',
	books: 'Book[]'
};

class Store extends model.Class {

	constructor(values) {
		super(attributes, values);
	}
}

module.exports = Store;