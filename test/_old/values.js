'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model = require('../lib/abstract-model'),
	Book  = require('./models/book');

var describe = mocha.describe,
	it       = mocha.it,
	before   = mocha.before;

describe('Values', function() {
	before(function() {
		model.init({
			modelRoot: './test/models'
		});
	});

	it('should only return with the predefined attribute\'s values', function() {
		var bookValues = {
			title: 'Title',
			author: 'Author',
			tags: [ 'tag1', 'tag2', 'tag3' ],
			iAmAStranger: 'Hello here, stranger',
			pages: 366
		};

		var book = new Book(bookValues),
			values = book.values;

		assert.equal(typeof values._attributes, 'undefined');
		assert.equal(typeof values._errors, 'undefined');
		assert.equal(typeof values.iAmAStranger, 'undefined');

		assert.equal(values.title, bookValues.title);
		assert.equal(values.pages, bookValues.pages);
		assert.deepEqual(values.tags, bookValues.tags);
	});

	it('should overwrite all the values', function() {
		var book = new Book(),
			valuesA = {
				title: 'I am a title',
				author: 'Test author',
				tags: [ 'test_tag1', 'test_tag2' ],
				pages: 455
			},
			valuesB = {
				title: 'I am also a title',
				tags: [ 'test_tag3', 'test_tag4' ]
			};

		book.values = valuesA;
		book.values = valuesB;

		assert.equal(book.title, valuesB.title);
		assert.equal(typeof book.author, 'undefined');
		assert.deepEqual(book.tags, valuesB.tags);
		assert.equal(typeof book.pages, 'undefined');
	});

	it('should only overwrites the predefined attribute\'s values', function() {
		var book = new Book(),
			valuesA = {
				title: 'I am a title',
				author: 'Test author',
				tags: [ 'test_tag1', 'test_tag2' ],
				pages: 455
			},
			valuesB = {
				_attributes: {},
				title: 'I am also a title',
				tags: [ 'test_tag3', 'test_tag4' ]
			};

		book.values = valuesA;
		book.values = valuesB;

		var otherBook = new Book();

		otherBook.values = valuesA;

		assert.deepEqual(book._attributes, otherBook._attributes);
		assert.deepEqual(book.tags, valuesB.tags);
		assert.equal(book.title, valuesB.title);
	});
});