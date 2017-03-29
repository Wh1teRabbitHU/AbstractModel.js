'use strict';

var assert = require('assert'),
	mocha  = require('mocha'),
	path   = require('path');

var model = require('../lib/abstract-model'),
	AlreadyRegisteredException = require('../lib/exceptions/already-registered-exception');

var ClassA = require('./models/sub-folder-a/class-a'),
	ClassB = require('./models/sub-folder-b/class-b'),
	ClassC = require('./models/sub-folder-a/sub-folder-c/class-c'),
	ClassD = require('./models/sub-folder-b/sub-folder-d/class-d'),
	ClassE = require('./models/sub-folder-b/sub-folder-d/sub-folder-e/class-e');

const aliasA = ClassA.name;
const aliasB = ClassB.name;
const aliasC = ClassC.name;
const aliasD = ClassD.name;
const aliasE = ClassE.name;

var describe   = mocha.describe,
	it         = mocha.it,
	beforeEach = mocha.beforeEach;

describe('IsInstanceRegistered', function() {
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

// without alias

describe('RegisterInstance', function() {
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

// register all module, recursively, options

describe('RegisterFolder', function() {
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

	it('should only register those modules which are under the target folder, recursively', function() {

		model.registerFolder(path.resolve(__dirname, './models/sub-folder-a'), true);

		assert.ok(model.isInstanceRegistered(aliasA));
		assert.ok(!model.isInstanceRegistered(aliasB));
		assert.ok(model.isInstanceRegistered(path.join('sub-folder-c', aliasC)));
		assert.ok(!model.isInstanceRegistered(aliasD));
		assert.ok(!model.isInstanceRegistered(aliasE));
	});

	it('should only register those modules which are under the target folder, recursively given by the options', function() {

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

});