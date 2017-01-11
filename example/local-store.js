'use strict';

var model       = require('../lib/abstract-model'),
	Book        = require('./models/book'),
	Store       = require('./models/store'),
	StoreKeeper = require('./models/store-keeper');

var books        = require('./data/books'),
	storeKeepers = require('./data/store-keepers'),
	stores       = require('./data/stores');

model.init({
	modelRoot: './models'
});

let book1 = new Book(books[0]);

console.log('\n\nLets see a simple constructor initialized book entity: ');
console.log(book1);

book1.update(books[1]);

console.log('\n\nUpdate it with different values: ');
console.log(book1);

book1.values = books[2];

console.log('\n\nOverwrite all the values: ');
console.log(book1);

let book2 = model.parse({
	_class: 'Book',
	title: 'Dune',
	author: 'Arthur C. Clarke',
	release: 1965,
	tags: [ 'Sci-fi', 'Drama', 'Space' ],
	pages: 534
});

console.log('\n\nCreate a book object from simple javascript object. The parser know his job: ');
console.log(book2);

let store1 = new Store();

console.log(store1);

store1.update(stores[0]);

console.log('\n\nCreate a new store and update with values after the initialization: ');
console.log(store1);

store1.update({
	books: [ books[3], books[4], books[5] ]
});

console.log('\n\nUpdate its book array with three predefined books: ');
console.log(store1);

let store2 = new Store(stores[1]);

store2.values = {
	name: 'Newly opened store',
	books: books,
	workers: storeKeepers,
	owner: storeKeepers[0]
};

console.log('\n\nOverwrite entirely all the values with a new one in another store object: ');
console.log(store2);

let storeKeeper1 = new StoreKeeper(storeKeepers[1]);

let store = new Store({
	name: 'Newly opened store',
	books: [
		book1,
		new Book(books[1]),
		books[2]
	],
	workers: [
		storeKeeper1,
		storeKeepers[0]
	],
	owner: storeKeepers[2]
});

console.log('\n\nPlay dirty. Mix all value types and initialization methods in a constructor: ');
console.log(store);

book1.values = {
	author: 'George Orwell',
	release: 1949,
	tags: [ 'Sci-fi', 'Dystopia', 'Drama' ],
	pages: 701
};

console.log('\n\nOh no, Orwell forgot his book\'s title and exceed the maximum page number with one. It must generate an error object like this: ');
console.log('Errors: ', book1.validate());

let book2Copy = new Book({
	title: 'Dune',
	author: 'Arthur C. Clarke',
	release: 1965,
	tags: [ 'Sci-fi', 'Drama', 'Space' ],
	pages: 534
});

console.log('\n\nLooks like we created an other copy from the book2. We should check it: ');
console.log('Equals: ' + book2.equals(book2Copy));

book2.tags.sort();

console.log('\n\nReorder its tags, its just too ugly in this way... Its still equals with the copy:');
console.log('Equals: ' + book2.equals(book2Copy));
console.log('book2: ', book2);
console.log('book2Copy: ', book2Copy);