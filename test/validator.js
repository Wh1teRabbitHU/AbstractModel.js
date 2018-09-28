'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model               = require('../lib/abstract-model'),
	Book                = require('./models/book'),
	ValidationException = require('../lib/exceptions/validation-exception');

var describe   = mocha.describe,
	it         = mocha.it,
	before     = mocha.before;

var attributes;

describe('Validator', function() {
	before(function() {
		model.init({
			modelRoot: './test/models'
		});

		attributes = {
			title: {
				type: String,
				length: 5,
				required: true
			},
			author: {
				type: String,
				length: 20,
				required: true
			},
			tags: {
				type: String,
				isArray: true,
				required: true
			},
			pages: {
				type: Number,
				min: 10,
				max: 100,
				required: true
			},
			genre: {
				type: String,
				values: [ 'sci-fi', 'action', 'noir' ]
			},
			catalogNumber: {
				type: String,
				regexp: /[A-Z]{3}[0-9]{6}/
			},
			isTooLongToRead: {
				type: Boolean,
				custom: function(value) {
					return value;
				}
			}
		};
	});

	it('should run the \'normal\' validation without any exeption', function() {
		let values = {
				title: 'Test title',
				author: 'Test author',
				tags: [ 'one', 'two', 'three' ],
				pages: 366,
				genre: 'action',
				catalogNumber: 'BBC123456',
				isTooLongToRead: true
			},
			book = new Book();

		var errorObj;

		book.update(values);

		assert.doesNotThrow(function() {
			errorObj = book.validate('normal');
		}, ValidationException);

		assert.deepEqual(errorObj, {});

		assert.equal(book.hasErrors, false);
	});

	it('should run the \'strict\' validation without any exeption', function() {
		let values = {
				title: 'Test title',
				author: 'Test author',
				tags: [ 'one', 'two', 'three' ],
				pages: 366,
				genre: 'action',
				catalogNumber: 'BBC123456',
				isTooLongToRead: true
			},
			book = new Book();

		book.update(values);

		assert.doesNotThrow(function() {
			book.validate('strict');
		}, ValidationException);

		assert.equal(book.hasErrors, false);
	});

	it('should return with error object if something failed during the validation and in the \'normal\' mode', function() {
		let newValues = {
			title: 'Test title, longer than it should be',
			author: 'I am an author',
			tags: [],
			pages: 55,
			genre: 'action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		var errorObj;

		otherBook.update(newValues);

		assert.doesNotThrow(function() {
			errorObj = otherBook.validate('normal');
		}, ValidationException);

		assert.deepEqual(errorObj, {
			title: [ 'length' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should throws exception if something failed during the validation and in the \'strict\' mode', function() {
		let newValues = {
			title: 'Test title, longer than it should be',
			author: 'I am an author',
			tags: [],
			pages: 55,
			genre: 'action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'min\' validation failed', function() {
		let newValues = {
			title: 'Test',
			author: 'I am an author',
			tags: [],
			pages: 9,
			genre: 'action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			pages: [ 'min' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'max\' validation failed', function() {
		let newValues = {
			title: 'Test',
			author: 'I am an author',
			tags: [],
			pages: 101,
			genre: 'action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			pages: [ 'max' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'length\' validation failed', function() {
		let newValues = {
			title: 'Test001',
			author: 'I am an author, a very long named author',
			tags: [],
			pages: 42,
			genre: 'action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			title: [ 'length' ],
			author: [ 'length' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'required\' validation failed', function() {
		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			title: [ 'required' ],
			author: [ 'required' ],
			tags: [ 'required' ],
			pages: [ 'required' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'values\' validation failed', function() {
		let newValues = {
			title: 'Test',
			author: 'I am an author',
			tags: [],
			pages: 42,
			genre: 'not-action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			genre: [ 'values' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'regexp\' validation failed', function() {
		let newValues = {
			title: 'Test',
			author: 'I am an author',
			tags: [],
			pages: 42,
			genre: 'action',
			catalogNumber: 'BB1234567',
			isTooLongToRead: true
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			catalogNumber: [ 'regexp' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});

	it('should notice if the \'custom\' validation failed', function() {
		let newValues = {
			title: 'Test',
			author: 'I am an author',
			tags: [],
			pages: 67,
			genre: 'action',
			catalogNumber: 'BBC123456',
			isTooLongToRead: false
		};

		class OtherBookClass extends model.Class {
			constructor(values) {
				super(attributes, values);
			}
		}

		var otherBook = new OtherBookClass();

		otherBook.update(newValues);

		assert.throws(function() {
			otherBook.validate('strict');
		}, ValidationException);

		var errorObj = otherBook.validate('normal');

		assert.deepEqual(errorObj, {
			isTooLongToRead: [ 'custom' ]
		});

		assert.equal(otherBook.hasErrors, true);
	});
});