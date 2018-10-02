'use strict';

const assert     = require('assert');
const mocha      = require('mocha');

const model      = require('../lib/abstract-model');
const objectUtil = require('../lib/utils/object');
const Book       = require('./models/book');
const ClassA     = require('./models/sub-folder-a/class-a');

const InvalidTypeException       = require('../lib/exceptions/invalid-type-exception');
const MissingAttributeException  = require('../lib/exceptions/missing-attribute-exception');
const AlreadyRegisteredException = require('../lib/exceptions/already-registered-exception');

const describe   = mocha.describe;
const it         = mocha.it;
const beforeEach = mocha.beforeEach;

const bookAlias = 'bookAlias';

const bookValues = {
	_class: 'Book',
	title: 'Title',
	author: 'Author',
	tags: [ 'tag1', 'tag2', 'tag3' ],
	pages: 366
};

const bookValuesWithAlias = {
	_class: bookAlias,
	title: 'Title',
	author: 'Author',
	tags: [ 'tag1', 'tag2', 'tag3' ],
	pages: 366
};

const bookValuesWithInstance = {
	_class: Book,
	title: 'Title',
	author: 'Author',
	tags: [ 'tag1', 'tag2', 'tag3' ],
	pages: 366
};

const bookValuesWithoutClass = {
	title: 'Title',
	author: 'Author',
	tags: [ 'tag1', 'tag2', 'tag3' ],
	pages: 366
};

describe('Parsing', function() {
	beforeEach(function() {
		model.dropRegisteredClasses();
	});

	it('should parse an object into the provided class instance', function() {
		model.registerClass(Book);

		let book;

		assert.doesNotThrow(function() {
			book = model.parseObject(bookValues);
		}, InvalidTypeException);

		assert(objectUtil.instanceOf(book, Book));

		assert.doesNotThrow(function() {
			book = model.parseObject(bookValuesWithInstance);
		}, InvalidTypeException);

		assert(objectUtil.instanceOf(book, Book));

		assert.doesNotThrow(function() {
			book = model.parseObject(bookValuesWithoutClass, 'Book');
		}, InvalidTypeException);

		assert(objectUtil.instanceOf(book, Book));

		assert.doesNotThrow(function() {
			book = model.parseObject(bookValuesWithoutClass, Book);
		}, InvalidTypeException);

		assert(objectUtil.instanceOf(book, Book));
	});

	it('should overwrite an already registered class, without throwing and error', function() {
		model.registerClass(Book, bookAlias);

		assert.doesNotThrow(function() {
			model.registerClass(ClassA, bookAlias, true);
		}, AlreadyRegisteredException);

		assert.throws(function() {
			model.registerClass(ClassA, bookAlias);
		}, AlreadyRegisteredException);

		assert(model.isClassRegistered(bookAlias));
	});

	it('should check if a class registered with the \'isClassRegistered\' function', function() {
		model.registerClass(Book);

		assert(model.isClassRegistered(Book));

		assert.throws(function() {
			model.isClassRegistered();
		}, MissingAttributeException);

		assert.throws(function() {
			model.isClassRegistered(13);
		}, InvalidTypeException);
	});

	it('should clear all the registered classes with the \'dropRegisteredClasses\' function', function() {
		model.registerClass(Book);
		model.dropRegisteredClasses();

		assert(!model.isClassRegistered(Book));
	});

	it('should register a class properly using an alias', function() {
		model.registerClass(Book, bookAlias);

		let book;

		assert.doesNotThrow(function() {
			book = model.parseObject(bookValues, bookAlias);
		}, InvalidTypeException);

		assert(objectUtil.instanceOf(book, Book));

		assert.doesNotThrow(function() {
			book = model.parseObject(bookValuesWithAlias);
		}, InvalidTypeException);

		assert(objectUtil.instanceOf(book, Book));
	});

	it('should throw an error if the provided class or an alias is missing or bad type', function() {
		model.registerClass(Book);

		assert.throws(function() {
			model.parseObject(bookValuesWithoutClass);
		}, MissingAttributeException);

		assert.throws(function() {
			model.parseObject(bookValuesWithoutClass, 13);
		}, InvalidTypeException);

		assert.throws(function() {
			model.parseObject(13);
		}, InvalidTypeException);
	});

	it('should throw an error if a class instance registered twice', function() {
		model.registerClass(Book);

		assert.throws(function() {
			model.registerClass(Book);
		}, AlreadyRegisteredException);

		model.registerClass(Book, bookAlias);

		assert.throws(function() {
			model.registerClass(Book, bookAlias);
		}, AlreadyRegisteredException);
	});
});