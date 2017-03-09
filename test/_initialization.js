'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var Book                      = require('./models/book'),
	InitializationException   = require('../lib/exceptions/initialization-exception');

var describe = mocha.describe,
	it       = mocha.it;

describe('Initialization', function() {
	it('should throw an \'InitializationException\' when the class used without initialization', function() {
		assert.throws(function() {
			var book = new Book(); // eslint-disable-line no-unused-vars
		}, InitializationException);
	});
});