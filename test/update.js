'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model                = require('../lib/abstract-model'),
	Book                 = require('./models/book'),
	InvalidTypeException = require('../lib/exceptions/invalid-type-exception');

var describe = mocha.describe,
	it       = mocha.it,
	before   = mocha.before;

describe('Update', function() {
	before(function() {
		model.init({
			modelRoot: './test/models'
		});
	});

	it('should set all given values to the model', function() {
		var book = new Book(),
			oldValues = book.values,
			newValues = {
				title: 'Test book',
				author: 'Test author',
				tags: [ 'test_tag1', 'test_tag2' ],
				pages: 366
			};

		Object.keys(oldValues).forEach(function(key) {
			assert.equal(typeof oldValues[key], 'undefined');
		});

		book.update(newValues);

		Object.keys(newValues).forEach(function(key) {
			assert.deepEqual(newValues[key], book[key]);
		});
	});

	it('should only set the attributes that initialized in the class', function() {
		var book = new Book(),
			values = {
				title: 'I am a title',
				weight: 'Hey, what are you doing...!',
				pages: 455,
				childrens: [ 'I', 'am', 'a', 'foreign', 'attribute' ]
			};

		book.update(values);

		assert.equal(book.title, values.title);
		assert.equal(typeof book.weight, 'undefined');
		assert.deepEqual(typeof book.childrens, 'undefined');
	});

	it('should only update the class with the given values', function() {
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

		book.update(valuesA);
		book.update(valuesB);

		assert.equal(book.title, valuesB.title);
		assert.equal(book.author, valuesA.author);
		assert.deepEqual(book.tags, valuesB.tags);
		assert.equal(book.pages, valuesA.pages);
	});

	it('should handle all value types', function() {
		var attributes = {
			_class: 'PrimitiveOnly',
			stringAttr: 'String',
			numberAttr: 'Number',
			booleanAttr: 'Boolean',
			objectAttr: 'Object',
			arrayAttr: 'String[]',
			bookAttr: 'Book'
		};

		class PrimitiveOnlyClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.doesNotThrow(function() {
			var primitiveOnly = new PrimitiveOnlyClass();

			primitiveOnly.update({
				stringAttr: 'string',
				numberAttr: 42,
				booleanAttr: true,
				objectAttr: {
					title: 'Test object',
					message: 'Test message'
				},
				arrayAttr: [ 'one', 'two', 'three' ],
				bookAttr: new Book()
			});
		}, InvalidTypeException);
	});

	it('should throws exception if the given value has wrong type', function() {
		var attributes = {
			_class: 'PrimitiveOnly',
			stringAttr: 'String',
			numberAttr: 'Number',
			booleanAttr: 'Boolean',
			objectAttr: 'Object',
			arrayAttr: 'String[]',
			bookAttr: 'Book'
		};

		class PrimitiveOnlyClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var primitiveOnly = new PrimitiveOnlyClass();

		assert.throws(function() {
			primitiveOnly.update({ stringAttr: 12 });
		}, InvalidTypeException);

		assert.throws(function() {
			primitiveOnly.update({ numberAttr: 'string' });
		}, InvalidTypeException);

		assert.throws(function() {
			primitiveOnly.update({ booleanAttr: 'true' });
		}, InvalidTypeException);

		assert.throws(function() {
			primitiveOnly.update({ objectAttr: 'object' });
		}, InvalidTypeException);

		assert.throws(function() {
			primitiveOnly.update({ arrayAttr: 'not array' });
		}, InvalidTypeException);

		assert.throws(function() {
			primitiveOnly.update({ bookAttr: 'i am a book, i promise!' });
		}, InvalidTypeException);
	});

	it('should create custom class from simple object', function() {
		var attributes = {
				_class: 'OtherBookClass',
				bookAttr: 'Book'
			},
			bookValues = {
				title: 'Title',
				author: 'Author',
				tags: [ 'tag1', 'tag2', 'tag3' ],
				pages: 366
			};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBookClass = new OtherBookClass();

		assert.doesNotThrow(function() {
			otherBookClass.update({ bookAttr: bookValues });
		}, InvalidTypeException);

		assert.deepEqual(typeof otherBookClass.bookAttr, typeof new Book());

		Object.keys(bookValues).forEach(function(key) {
			assert.deepEqual(bookValues[key], otherBookClass.bookAttr[key]);
		});
	});

	it('should initialize an array attribute if its recently initialized', function() {
		var book = new Book(),
			tagArray = [ 'tag1', 'tag2', 'tag3' ];

		book.update({ tags: tagArray });

		assert.deepEqual(book.tags, tagArray);

		book.update({ tags: null });

		assert.deepEqual(book.tags, []);
	});

	it('should create two equal custom object if they have the same values', function() {
		var attributes = {
				_class: 'ComplexBookClass',
				otherBooks: 'Book[]'
			},
			bookValues = {
				title: 'Title',
				author: 'Author',
				tags: [ 'tag1', 'tag2', 'tag3' ],
				pages: 366
			},
			complexBookValues = {
				otherBooks: [ bookValues, new Book(bookValues) ]
			};

		class ComplexBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var complexBookClass = new ComplexBookClass();

		complexBookClass.update(complexBookValues);

		assert.deepEqual(complexBookClass.otherBooks[0], complexBookClass.otherBooks[1]);
	});

	it('should initialize attributes if their types defined with an Object, not a string', function() {
		var attributes = {
				_class: 'ComplexBookClass',
				title: {
					type: 'String'
				},
				author: {
					type: 'String'
				},
				tags: {
					type: 'String[]'
				},
				pages: {
					type: 'Number'
				},
				otherBooks: {
					type: 'Book[]'
				}
			},
			bookValues = {
				title: 'Title',
				author: 'Author',
				tags: [ 'tag1', 'tag2', 'tag3' ],
				pages: 366
			},
			complexBookValues = {
				title: 'Title',
				author: 'Author',
				tags: [ 'tag1', 'tag2', 'tag3' ],
				pages: 366,
				otherBooks: [ bookValues, new Book(bookValues) ]
			};

		class ComplexBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.doesNotThrow(function() {
			var complexBookClass = new ComplexBookClass();

			complexBookClass.update(complexBookValues);
		});
	});

});