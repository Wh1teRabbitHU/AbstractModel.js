'use strict';

var model = require('../lib/abstract-model'),
	Book = require('./models/book'),
	Store = require('./models/store');

model.init({
	modelRoot: './example/models'
});

var myBook1 = new Book({
		title: 'Harry potter',
		author: 'J. K. Rowling',
		tags: [ 'Fantasy', 'Magic' ],
		pages: 654
	}),
	myBook2 = new Book({
		title: 'Lords of the rings',
		author: 'J. R. R. Tolkien',
		tags: [ 'Fantasy', 'Elven', 'Hobbit' ],
		pages: 454
	}),
	myBook3 = new Book({
		title: '2001 Space odyssey',
		author: 'Arthur C. Clarke',
		tags: [ 'Sci-fi', 'Monkeys', 'Space' ],
		pages: 310
	}),
	myStore = new Store({
		name: 'Books & Albums co.',
		owner: 'Big Joe',
		books: [ myBook1, myBook2, myBook3 ]
	});

console.log(myStore);

var rawStoreData = {
	_class: 'Store',
	name: 'Only books',
	owner: 'Small Johanna',
	books: [ myBook1, myBook3 ]
};

var anotherStore = model.parse(rawStoreData);

console.log(anotherStore);

module.exports = {
	myStore: myStore,
	anotherStore: anotherStore
};