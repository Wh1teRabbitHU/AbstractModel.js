'use strict';

var assert = require('assert'),
	mocha  = require('mocha');

var model = require('../lib/abstract-model'),
	Book  = require('./models/book');

var describe   = mocha.describe,
	it         = mocha.it,
	beforeEach = mocha.beforeEach;

var classA, classB;

function createTwoIdenticalObject() {
	var attributes = {
			title: {
				type: String
			},
			author: {
				type: String
			},
			tags: {
				type: String,
				isArray: true
			},
			pages: {
				type: Number
			},
			otherBooks: {
				type: Book,
				isArray: true
			},
			simpleObject: Object
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
			otherBooks: [ bookValues, new Book(bookValues) ],
			simpleObject: {
				a: 'I am a',
				b: 27,
				c: [ 'a', 'b' ]
			}
		};

	class ComplexBookClass extends model.Class {
		constructor(values) {
			super(attributes, values);
		}
	}

	var a = new ComplexBookClass(),
		b = new ComplexBookClass();

	a.update(complexBookValues);
	b.update(complexBookValues);

	classA = a;
	classB = b;
}

describe('Equals', function() {
	beforeEach(function() {
		createTwoIdenticalObject();
	});

	it('should be equals if the class and the values are the same!', function() {
		assert.ok(classA.equals(classB));
	});

	it('should be equals if the class and the values are the same, but an array values are mixed!', function() {
		var first = classB.tags[0];

		classB.tags[0] = classB.tags[2];
		classB.tags[2] = first;

		assert.ok(classA.equals(classB));
	});

	it('should not equals if one of them is null or undefined', function() {
		classB = null;

		assert.ok(!classA.equals(classB));

		var classC;

		assert.ok(!classA.equals(classC));
	});

	it('should not equals if an array type attribute has more elements than the others', function() {
		classB.otherBooks.push(new Book());

		assert.ok(!classA.equals(classB));
	});

	it('should not equals if an Object type attribute has more attribute than the others', function() {
		classB.simpleObject = {
			a: 'I am a',
			b: 27,
			c: [ 'a', 'b' ],
			d: 'Hey!'
		};

		assert.ok(!classA.equals(classB));
	});

	it('should not equals if everything is the same but the class', function() {
		class OtherComplexBookClass extends model.Class {
			constructor(values) {
				super(classB._attributes, values);
			}
		}

		var otherClassB = new OtherComplexBookClass(classB.values);

		assert.ok(!classA.equals(otherClassB));
	});
});