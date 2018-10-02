'use strict';

var model = require('../../lib/abstract-model');

const attributes = {
	title: {
		type: String,
		required: true
	},
	author: String,
	release: Number,
	tags: [ String ],
	pages: {
		type: Number,
		max: 700
	}
};

class Book extends model.Class {

	constructor(values) {
		super(attributes, values);
	}
}

module.exports = Book;