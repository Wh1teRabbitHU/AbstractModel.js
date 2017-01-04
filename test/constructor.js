'use strict';

var assert = require('assert'),
	mocha  = require('mocha'),
	path   = require('path');

var model                     = require('../lib/abstract-model'),
	Book                      = require('./models/book'),
	InitializationException   = require('../lib/exceptions/initialization-exception'),
	InvalidTypeException      = require('../lib/exceptions/invalid-type-exception'),
	MissingAttributeException = require('../lib/exceptions/missing-attribute-exception');

var describe = mocha.describe,
	it       = mocha.it,
	before   = mocha.before;

describe('Initialization', function() {
	it('should throw an \'InitializationException\' when the class used without initialization', function() {
		assert.throws(function() {
			var book = new Book(); // eslint-disable-line no-unused-vars
		}, InitializationException);
	});
});

describe('Constructor', function() {
	before(function() {
		model.init({
			modelRoot: './test/models'
		});
	});

	it('should create a \'Book\' class, without throwing exceptions', function() {
		assert.doesNotThrow(function() {
			var book = new Book(); // eslint-disable-line no-unused-vars
		});
	});

	it('should create a new, empty class with \'Book\' type', function() {
		var book = new Book();

		assert.equal(typeof Book.prototype, typeof book);

		var values = book.values;

		Object.keys(values).every(function(key) {
			assert.equal(typeof values[key], 'undefined');
		});
	});

	it('should initialize the class with the given values', function() {
		var values = {
				title: 'Test book',
				author: 'Test author',
				pages: 366
			},
			book = new Book(values);

		Object.keys(values).forEach(function(key) {
			assert.equal(values[key], book[key]);
		});
	});

	it('should use the given \'_class\' attribute instead of the calculated one', function() {
		var values = {
				_class: 'NotABook',
				title: 'Test book',
				author: 'Test author',
				pages: 366
			},
			book = new Book(values);

		assert.equal(book._class, values._class);
	});

	it('should load the custom class with full class path', function() {
		var bookPath = path.join(__dirname, './models/book');

		var values = {
			_class: bookPath,
			title: 'Test book',
			author: 'Test author',
			pages: 366
		};

		assert.doesNotThrow(function() {
			var book = new Book(values); // eslint-disable-line no-unused-vars
		});
	});

	it('should throws exception if predefined attributes are missing or null', function() {
		assert.throws(function() {
			var attributes;

			class AnotherBook extends model.Class {
				constructor(values) {
					super(attributes, values);
				}
			}

			var anotherBook = new AnotherBook(); // eslint-disable-line no-unused-vars
		}, MissingAttributeException);

		assert.throws(function() {
			var attributes = null;

			class AnotherBook extends model.Class {
				constructor(values) {
					super(attributes, values);
				}
			}

			var anotherBook = new AnotherBook(); // eslint-disable-line no-unused-vars
		}, MissingAttributeException);
	});

	it('should throws exception if the given attribute has an unknown type', function() {
		var attributes = {
			snowFlakeType: 'IAmSpecial',
			moreSnowFlakeType: 'ButAlsoInvalid',
		};

		class SpecialClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.throws(function() {
			var specialClass = new SpecialClass(); // eslint-disable-line no-unused-vars
		}, InvalidTypeException);
	});

	it('should throws exception if the given custom class cannot be found', function() {
		var attributes = {
			bookShelfAttr: 'BookShelf'
		};

		class ShelfClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.throws(function() {
			var shelfClass = new ShelfClass(); // eslint-disable-line no-unused-vars
		}, InvalidTypeException);
	});

	it('should get all the attributes', function() {
		var attributes = {
			title: 'String',
			author: 'String',
			tags: 'String[]',
			pages: 'Number'
		};

		class AnotherBook extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var anotherBook = new AnotherBook();

		assert.equal(attributes.length, anotherBook._attributes.length);

		Object.keys(anotherBook._attributes).forEach(function(key) {
			assert.equal(attributes[key], anotherBook._attributes[key]);
		});
	});
});