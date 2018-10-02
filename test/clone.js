'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model = require('../lib/abstract-model'),
	Book  = require('./models/book');

var describe   = mocha.describe,
	it         = mocha.it,
	before     = mocha.before,
	beforeEach = mocha.beforeEach;

const attributes = {
	title: String,
	authors: [ String ],
	tags: [ String ],
	emptyAttr: Object,
	pages: Number,
	genre: {
		type: String,
		values: [ 'sci-fi', 'action', 'noir' ]
	},
	books: [ Book ],
	isTooLongToRead: Boolean
};

var testEntity, testValues;

class TestClass extends model.Class {
	constructor(values) {
		super(attributes, values);
	}
}

describe('Equals', function() {
	before(function() {
		testValues = {
			title: 'Test entity',
			tags: [ 'a', 'b', 'c' ],
			pages: 654,
			emptyAttr: {},
			genre: 'sci-fi',
			books: [
				new Book({
					title: 'Test book',
					author: 'Test author',
					pages: 366
				}),
				new Book({
					title: 'Test book 3',
					author: 'Test author 3',
					pages: 310
				})
			]
		};
	});

	beforeEach(function() {
		testEntity = new TestClass(testValues);
	});

	it('should have the same values', function() {
		var clone = testEntity.clone();

		assert.equal(testEntity.equals(clone), true);
	});

	it('should not change if the original entitity updated', function() {
		var clone = testEntity.clone();

		testEntity.pages = 333;

		assert.equal(clone.pages, testValues.pages);
	});

	it('should not change if a subentity is changed in the original entity', function() {
		var clone = testEntity.clone(),
			clone2 = clone.clone();

		testEntity.books[0].title = 'Not a test book!';

		assert.equal(clone.books[0].title, clone2.books[0].title);
	});

	it('should not change if an array is changed in the original entity', function() {
		var clone = testEntity.clone();

		testEntity.tags.push('ZzzZZzzZZ');

		assert.deepEqual(clone.tags, testValues.tags);
	});

	it('should not change the original entity if the clone change', function() {
		var clone = testEntity.clone();

		clone.title = 'Another test case';

		assert.equal(testEntity.equals(clone), false);
	});

	it('should not change the original entity if the clone\'s values are fully deleted', function() {
		var clone = testEntity.clone();

		clone.values = {};

		assert.equal(testEntity.equals(clone), false);
	});

	it('should still have the common constructor', function() {
		var clone = testEntity.clone();

		clone.values = {};

		assert.equal(testEntity.constructor === clone.constructor, true);
	});

	it('should not have common objects after cloning multiple times', function() {
		var clone = testEntity.clone(),
			clone2 = clone.clone();

		clone.values = {};

		assert.equal(testEntity.equals(clone2), true);
	});

	it('should not have common objects after cloning multiple times', function() {
		var clone = testEntity.clone(),
			clone2 = clone.clone();

		clone2.books[0].title = 'Not again!';

		clone.books[0].values = {};
		clone.books[0] = clone2.books[0];

		assert.equal(testEntity.books[0].equals(clone.books[0]), false);
	});

});