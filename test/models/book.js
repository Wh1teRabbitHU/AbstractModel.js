'use strict';

var model = require('../../lib/abstract-model');

const attributes = {
	_class: 'Book',
	title: 'String',
	author: 'String',
	tags: 'String[]',
	pages: 'Number'
};

class Book extends model.Class {

	constructor(values) {
		super(attributes, values);
	}
}

module.exports = Book;