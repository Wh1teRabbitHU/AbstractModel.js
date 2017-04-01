'use strict';

var assert = require('assert'),
	mocha  = require('mocha'),
	path   = require('path');

var model = require('../lib/abstract-model'),
	AlreadyRegisteredException = require('../lib/exceptions/already-registered-exception');

var Book   = require('./models/book'),
	ClassA = require('./models/sub-folder-a/class-a'),
	ClassB = require('./models/sub-folder-b/class-b'),
	ClassC = require('./models/sub-folder-a/sub-folder-c/class-c'),
	ClassD = require('./models/sub-folder-b/sub-folder-d/class-d'),
	ClassE = require('./models/sub-folder-b/sub-folder-d/sub-folder-e/class-e');

const aliasBook = Book.name;
const aliasA = ClassA.name;
const aliasB = ClassB.name;
const aliasC = ClassC.name;
const aliasD = ClassD.name;
const aliasE = ClassE.name;

var describe   = mocha.describe,
	it         = mocha.it,
	before     = mocha.before,
	beforeEach = mocha.beforeEach;

describe('Is instance registered', function() {
	beforeEach(function() {
		model.init({
			modelRoot: './test/models'
		});
	});

	it('should be true, if a class instance registered by the main method!', function() {
		let alias = 'class-a';

		model.registerInstance(ClassA, alias);

		assert.ok(model.isInstanceRegistered(alias));
	});

	it('should be false, if the alias did not registered, yet!', function() {
		let alias = 'class-a';

		assert.ok(!model.isInstanceRegistered(alias));
	});

});

describe('Register instance', function() {
	beforeEach(function() {
		model.init({
			modelRoot: './test/models'
		});
	});

	it('should be true, if a class instance registered by the main method!', function() {
		let alias = 'class-a';

		model.registerInstance(ClassA, alias);

		assert.ok(model.isInstanceRegistered(alias));
	});

	it('should throw exception, if an alias registered twice and the ignoreDuplicate option is false!', function() {
		let alias = 'class-a';

		model.init({
			modelRoot: './test/models',
			ignoreDuplicate: false
		});

		model.registerInstance(ClassA, alias);

		assert.throws(function() {
			model.registerInstance(ClassB, alias);
		}, AlreadyRegisteredException);
	});

	it('shouldn\'t throw exception, if two identical instace registered, but with different aliases!', function() {
		let alias = 'class-a',
			alias2 = 'class-a-2';

		model.registerInstance(ClassA, alias);

		assert.doesNotThrow(function() {
			model.registerInstance(ClassA, alias2);
		}, AlreadyRegisteredException);
	});

	it('should give the proper alias if it registered without one!', function() {
		model.registerInstance(ClassA);

		assert.ok(model.isInstanceRegistered(aliasA));
	});

});

describe('Register folder', function() {
	beforeEach(function() {
		model.init({
			modelRoot: './test/models'
		});
	});

	it('should only register the target folder\'s modules, without subfolders!', function() {

		model.registerFolder(path.resolve(__dirname, './models/sub-folder-a'));

		assert.ok(model.isInstanceRegistered(aliasA));
		assert.ok(!model.isInstanceRegistered(aliasB));
		assert.ok(!model.isInstanceRegistered(aliasC));
		assert.ok(!model.isInstanceRegistered(aliasD));
		assert.ok(!model.isInstanceRegistered(aliasE));
	});

	it('should only register those modules which are under the target folder, if \'recursively\' parameter is true', function() {

		model.registerFolder(path.resolve(__dirname, './models/sub-folder-a'), true);

		assert.ok(model.isInstanceRegistered(aliasA));
		assert.ok(!model.isInstanceRegistered(aliasB));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-c', aliasC)));
		assert.ok(!model.isInstanceRegistered(aliasD));
		assert.ok(!model.isInstanceRegistered(aliasE));
	});

	it('should only register those modules which are under the target folder, if \'recursively\' option is true', function() {

		model.init({
			modelRoot: './test/models',
			scanRecursively: true
		});

		model.registerFolder(path.resolve(__dirname, './models/sub-folder-b'));

		assert.ok(!model.isInstanceRegistered(aliasA));
		assert.ok(model.isInstanceRegistered(aliasB));
		assert.ok(!model.isInstanceRegistered(aliasC));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-d', aliasD)));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-d/sub-folder-e', aliasE)));
	});

	it('should register all modules only with their name if \'onlyRegisterNames\' option is true', function() {

		model.init({
			modelRoot: './test/models',
			scanRecursively: true,
			onlyRegisterNames: true
		});

		model.registerFolder(path.resolve(__dirname, './models'));

		assert.ok(model.isInstanceRegistered(aliasA));
		assert.ok(model.isInstanceRegistered(aliasB));
		assert.ok(model.isInstanceRegistered(aliasC));
		assert.ok(model.isInstanceRegistered(aliasD));
		assert.ok(model.isInstanceRegistered(aliasE));
	});

	it('should throw exception, if an alias registered twice and the \'ignoreDuplicate\' option is false!', function() {
		model.init({
			modelRoot: './test/models',
			ignoreDuplicate: false
		});

		model.registerFolder(path.resolve(__dirname, './models/sub-folder-b'));

		assert.throws(function() {
			model.registerFolder(path.resolve(__dirname, './models/sub-folder-b'));
		}, AlreadyRegisteredException);
	});

	it('shouldn\'t throw exception, if two instance registered twice, but with different aliases', function() {

		model.init({
			modelRoot: './test/models',
			scanRecursively: true,
			ignoreDuplicate: false
		});

		model.registerFolder(path.resolve(__dirname, './models'));

		assert.doesNotThrow(function() {
			model.registerFolder(path.resolve(__dirname, './models/sub-folder-b'));
		}, AlreadyRegisteredException);

		// Instances ends with 'One' are registered in the first, ends with 'Two' registered in the second 'registerFolder' function call
		let instanceBOne = model.getInstance(aliasB),
			instanceBTwo = model.getInstance(path.join('sub-folder-b', aliasB)),
			instanceDOne = model.getInstance(path.join('sub-folder-d', aliasD)),
			instanceDTwo = model.getInstance(path.join('sub-folder-b/sub-folder-d', aliasD)),
			instanceEOne = model.getInstance(path.join('sub-folder-d/sub-folder-e', aliasE)),
			instanceETwo = model.getInstance(path.join('sub-folder-b/sub-folder-d/sub-folder-e', aliasE));

		assert.ok(instanceBOne.name === instanceBTwo.name);
		assert.ok(instanceDOne.name === instanceDTwo.name);
		assert.ok(instanceEOne.name === instanceETwo.name);
	});

	it('should throw exception, if an alias registered twice and the \'onlyRegisterNames\' and \'ignoreDuplicate\' options are true', function() {

		model.init({
			modelRoot: './test/models',
			scanRecursively: true,
			onlyRegisterNames: true,
			ignoreDuplicate: false
		});

		model.registerFolder(path.resolve(__dirname, './models'));

		assert.throws(function() {
			model.registerFolder(path.resolve(__dirname, './models/sub-folder-b'));
		}, AlreadyRegisteredException);
	});
});

describe('Registration options', function() {

	it('should scan the model root folder for model instances if \'scanForModels\' option is true', function() {
		model.init({
			modelRoot: './test/models',
			scanForModels: true
		});

		assert.ok(model.isInstanceRegistered(aliasBook));
	});

	it('should scan the model root folder recursively for model instances if \'scanForModels\' and \'scanRecursively\' options are true', function() {
		model.init({
			modelRoot: './test/models',
			scanForModels: true,
			scanRecursively: true
		});

		assert.ok(model.isInstanceRegistered(aliasBook));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-a', aliasA)));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-b', aliasB)));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-a/sub-folder-c', aliasC)));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-b/sub-folder-d', aliasD)));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-b/sub-folder-d/sub-folder-e', aliasE)));
	});

	it('should scan the model root folder recursively for model instances and register them with only names' +
		'if \'scanForModels\', \'scanRecursively\' and \'onlyRegisterNames\' options are true', function() {
		model.init({
			modelRoot: './test/models',
			scanForModels: true,
			scanRecursively: true,
			onlyRegisterNames: true
		});

		assert.ok(model.isInstanceRegistered(aliasBook));
		assert.ok(model.isInstanceRegistered(aliasA));
		assert.ok(model.isInstanceRegistered(aliasB));
		assert.ok(model.isInstanceRegistered(aliasC));
		assert.ok(model.isInstanceRegistered(aliasD));
		assert.ok(model.isInstanceRegistered(aliasE));
	});
});

describe('Registration and auto parsing', function() {
	const CLASS_A_ATTRIBUTES = {
		a: {
			type: 'ClassA'
		},
		b: 'ClassB',
		c: {
			type: 'ClassC[]'
		},
		d: 'ClassD[]',
		e: 'ClassE',
		mainBook: 'Book'
	};

	const CLASS_B_ATTRIBUTES = {
		a: {
			type: 'sub-folder-a/ClassA'
		},
		b: 'sub-folder-b/ClassB',
		c: {
			type: 'sub-folder-a/sub-folder-c/ClassC[]'
		},
		d: 'sub-folder-b/sub-folder-d/ClassD[]',
		e: 'sub-folder-b/sub-folder-d/sub-folder-e/ClassE',
		mainBook: 'Book'
	};

	class TestClassA extends model.Class {
		constructor(values) {
			super(CLASS_A_ATTRIBUTES, values);
		}
	}

	class TestClassB extends model.Class {
		constructor(values) {
			super(CLASS_B_ATTRIBUTES, values);
		}
	}

	var values = {
		a: {
			name: 'a-class',
			value: 'a'
		},
		b: {
			name: 'b-class',
			value: 'b'
		},
		c: [ {
			name: 'c-class',
			value: 'c1'
		}, {
			name: 'c-class',
			value: 'c2'
		} ],
		d: [ {
			name: 'd-class',
			value: 'd1'
		}, {
			name: 'd-class',
			value: 'd2'
		} ],
		e: {
			name: 'e-class',
			value: 'e'
		},
		mainBook: {
			title: 'Main test book',
			author: 'Test Joe'
		}
	};

	it('should initialize and parse sub classes if only names are registered', function() {
		model.init({
			modelRoot: './test/models',
			scanForModels: true,
			scanRecursively: true,
			onlyRegisterNames: true
		});

		let testClassA = new TestClassA();

		assert.doesNotThrow(function() {
			testClassA.update(values);
		});
	});

	it('should initialize and parse sub classes if full path aliases are registered', function() {
		model.init({
			modelRoot: './test/models',
			scanForModels: true,
			scanRecursively: true
		});

		let testClassB = new TestClassB();

		assert.doesNotThrow(function() {
			testClassB.update(values);
		});

		console.log(testClassB);
	});
});