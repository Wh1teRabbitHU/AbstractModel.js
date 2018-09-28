'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model                     = require('../lib/abstract-model'),
	objectUtil                = require('../lib/utils/object'),
	Book                      = require('./models/book'),
	InvalidTypeException      = require('../lib/exceptions/invalid-type-exception'),
	MissingAttributeException = require('../lib/exceptions/missing-attribute-exception');

var describe = mocha.describe,
	it       = mocha.it;

describe('Constructor', function() {

	it('should create a \'Book\' class, without throwing exceptions', function() {
		assert.doesNotThrow(function() {
			let book = new Book(); // eslint-disable-line no-unused-vars
		});
	});

	it('should create a new, empty class with \'Book\' type', function() {
		var book = new Book();

		assert(book instanceof Book);

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

	it('should load the custom class with full class path', function() {
		var values = {
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

	it('should throws exception if the given attribute\'s type is an array and not exactly one type given', function() {
		var attributes = {
			snowFlakeType: [ String, String ],
			moreSnowFlakeType: [],
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

	it('should throws exception if the given custom class is undefined', function() {
		var attributes = {
			bookShelfAttr: undefined // eslint-disable-line no-undefined
		};

		class UndefinedClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.throws(function() {
			var shelfClass = new UndefinedClass(); // eslint-disable-line no-unused-vars
		}, InvalidTypeException);
	});

	it('should throws exception if the given custom class is null', function() {
		var attributes = {
			bookShelfAttr: null // eslint-disable-line no-undefined
		};

		class NullClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.throws(function() {
			var shelfClass = new NullClass(); // eslint-disable-line no-unused-vars
		}, InvalidTypeException);
	});

	it('should convert simple initializers into object type', function() {
		var attributes = {
			title: String,
			author: String,
			tags: [ String ],
			pages: Number
		};

		class AnotherBook extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var anotherBook = new AnotherBook();

		assert.equal(attributes.length, anotherBook._attributes.length);

		assert.equal(typeof attributes.title, typeof anotherBook._attributes.title.type);
		assert.equal(typeof attributes.author, typeof anotherBook._attributes.author.type);
		assert.equal(typeof attributes.tags[0], typeof anotherBook._attributes.tags.type);
		assert.equal(typeof attributes.pages, typeof anotherBook._attributes.pages.type);
	});

	it('should get all the attributes', function() {
		var attributes = {
			title: String,
			author: String,
			tags: [ String ],
			genres: {
				type: String,
				isArray: true
			},
			pages: {
				type: Number,
				required: true
			}
		};

		class AnotherBook extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var anotherBook = new AnotherBook();

		assert.equal(attributes.length, anotherBook._attributes.length);

		Object.keys(anotherBook._attributes).forEach(function(key) {
			if (objectUtil.isPrimitive(attributes[key])) {
				assert.equal(typeof attributes[key], typeof anotherBook._attributes[key].type);
			} else if (objectUtil.isArray(attributes[key])) {
				assert.equal(typeof attributes[key][0], typeof anotherBook._attributes[key].type);
			} else {
				assert.equal(typeof attributes[key].type, typeof anotherBook._attributes[key].type);
			}
		});
	});
});