'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model                = require('../lib/abstract-model'),
	Book                 = require('./models/book'),
	InvalidTypeException = require('../lib/exceptions/invalid-type-exception');

var describe = mocha.describe,
	it       = mocha.it,
	before   = mocha.before;

// Ellenőrizendő: egyszerű típus, object, custom, tömb, key-value, key-object, null, undefined, validValueType

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
				arrayAttr: [ 'one', 'two', 'three' ]
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

	it('should throws exception if the given custom class cannot be found', function() {
		var attributes = {
			_class: 'ShelfClass',
			bookShelfAttr: 'BookShelf'
		};

		class ShelfClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		assert.throws(function() {
			var shelfClass = new ShelfClass();

			shelfClass.update({ bookShelfAttr: {} });
		}, InvalidTypeException);
	});
});