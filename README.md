# AbstractModel.js

## Description

It's an abstract model class with some basic functionality and validation tools. You can predefine all the attributes your class will ever use and the update function will take care of the rest. If your data structure needs validation, you can easily predefine some simple rules, too. Also you can parse any json objects and create an extended class instance with the module's parse function. Thanks to that you get an easy way to handle the client-server communications and data transfers. After you sent or received your data, you call the parser and it returns the class with all the functions, attributes and validators that you created.

## Installation

```
npm install abstract-model --save
```

## Usage

### Initialization

Before you do anything with your classes, you must initialize the abstract-model module:

#### Syntax:

```javascript
var model = require('abstract-model');

const OPTIONS = {
	modelRoot: './example/models'
};

model.init(OPTIONS);
```

#### Available options:

| Name | Type | Required? | Default | Description |
| ---- | ---- | --------- | ------- | ----------- |
| modelRoot | String | true | - | Path to your models. This attribute tells the class that where to find your models. After the initialization, if you pass a json object with a '_class' attribute to the parser, then it'll automaticly create the target class instance and update with the given values. If your model classes are separately structured, you also have to concat the subfolder's path to this attribute. |
| validatonMode | String | false | 'normal' | It define, how the validator handle the errors. There are two available values: 'normal', 'strict'. If the validator is in the 'strict' mode, the update function will throw error right after it set all the given values. In normal mode it do nothing, only if you retrieve the errors object ('_errors') or manualy validate the class |

Example folder structure for this scenario:

| Model path | '_class' value |
| ---------- | -------------- |
| ./models/library/book.js | 'library/book' |
| ./models/library/category.js | 'library/category' |
| ./models/library/shelf.js | 'library/shelf' |
| ./models/account/transport.js | 'account/transport' |
| ./models/account/bill.js | 'account/bill' |
| ./models/message.js | 'message' |

### Attributes

#### Attribute types

The following attribute types are available:

- String
- Number
- Boolean
- Object
- Custom (it will find the definition by the '_class' attribute and create a new instance if needed)

You can use arrays as attributes, too. The syntax is the same, but with an '[]' at the end. Examples:

- String[]
- Number[]
- Boolean[]
- Object[]
- Custom[]

#### How to define the attributes?

When you create a new class, you have to give the attributes to its super constructor. This is an Object type variable, and the keys are your attribute names. The value can be a String and it will be the type of your attribute or if you need some validator then Object. In this case, the type will be an attribute named to 'type' (suprise).
Examples:

#### Syntax:

```javascript
const CLASS_ATTRIBUTE = {
	title: 'String', 	// String-type attribute description
	name: { 			// Object-type attribute description
		type: 'String',
		max: 20,
		required: true
	}
}
```

#### Inner attributes

The module has some inner attributes. You cannot change them manualy for security and reliability reasons. Every inner attribute starts with an underscore.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _class | String | The class own name and/or path to the declaration |
| _attributes | Object | After you create a class it will contains all the predefined attributes. |
| _errors | Object | It contains those attributes that failed during the validation process. Every key is an attribute name and the value pair is array with the errors |

### Create a class

To extend and use your class, you won't need any special thing. In the constructor you have to pass the class attributes and the initializer values.

#### Syntax:

```javascript
var model = require('abstract-model');

var attributes = {
	stringAttr: 'String',
	numberAttr: 'Number',
	booleanAttr: 'Boolean',
	objectAttr: 'Object',
	arrayAttr: 'String[]',
	bookAttr: 'Book'
};

class AllTypeClass extends model.Class {

	constructor(values) {
		super(attributes, values);
	}

}
```

And thats all, you can use it now! Pass any object to the constructor (or the update function in any existing class instance) and it will only update the predefined attributes. If you have like 10 attributes, but your class defined with one 'title', then the update function only set the 'title', if its present in the values object, and leave the rest. But beware, if one of the values has different type than the one in the class with the same name, then it will throw an InvalidTypeException right after you try to update your class. There is only two exceptions:

- If the value is null
- Or its a single item, but you defined an array, then it will be added to an empty array and set for your class.

### Parsing json object

The module has a parser function, too. You can parse any object into an already defined class. The given object has to have a '_class' attribute to identify the target class. If its missing or the class cannot be located, the parser throws an error.

#### Example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

const bookValues = {
	_class: 'Book',
	title: 'New book',
	pages: 366
};

var book = model.parse(bookValues),
	book2 = new Book(bookValues);

console.log(book.equals(book2)); // true
```

## Validation

Every time the class's values are changed, the validate function will run. It has two mode: 'normal' (this is the default) and 'strict'. In 'normal' mode, all the attributes are checked and an Object returned with all the validation errors. In 'strict' mode if the validator find an error, it throws an error and the function stops. The validation rules are defined in the attributes definitons, so after you create the class, it cannot be changed. The following rules are available:

| Name | Types | Description |
| ---- | ----- | ----------- |
| min | Number | It check if the given min number is smaller than the attribute's value. It's inclusive, so it only throws error if the value is smaller. |
| max | Number | It check if the given max number is larger than the attribute's value. It's inclusive, so it only throws error if the value is larger. |
| length | String | It check if the given length is larger than the attribute's length. It's inclusive, so it only throws error if the value is longer. |
| required | All | It check if the attribute is given. It throws error if the value is null or undefined|

## Methods

### Constructor

What's the constructor's job?
It sets your predefined attributes to the class, initialize the given values (if nothing is added, then skip this part) and validate them. If the validator is in the 'strict' mode and find some inconsistence, it throws an error. (Its all after the update, so it sets your values anyway)

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

var book = new Book();

// or

var book2 = new Book({
	title: 'New book',
	pages: 366
});
```

### class.update(values)

It updates the class with the given values. It'll skip those attributes that not represented in the class. If one of the values has a different type than the class's predefined attribute then it will throw an error. The update function automatically validate the new values. In 'strict' mode if the validation fails, the function throws an error.

#### Example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

var book = new Book();

book.update({
	title: 'New book',
	pages: 366
});
```

### class.values

Every class has a values attribute with both getter and setter. When you retreive your values, it only returns the predefined attributes without the inner ones. If an attribute has no value, then it still included in the returned object, but it will be 'undefined'. If you set the values it will overwrite all the previous attributes. If the given object has more attribute than the class have, the code ignore those. The only different between the update function and this setter is if you use the setter it will change all the values, not just the given ones.

#### Getter example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

var book = new Book();

book.update({
	title: 'New book',
	pages: 366
});

/*
 {
 	title: 'New book',
 	author: undefined,
 	tags: undefined,
 	pages: 366
 }
 */
console.log(book.values);
```

#### Setter example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

var book = new Book({
	title: 'New book',
	author: 'New author',
	tags: [ 'a', 'b', 'c' ]
	pages: 266
});

book.values = {
	title: 'New book2',
	pages: 366
};

/*
 {
 	title: 'New book2',
 	author: undefined,
 	tags: undefined,
 	pages: 366
 }
 */
console.log(book.values);
```

### class.equals(otherClass)

It's determine if a class is equals to the b class. The class name/path, the given attributes and all the values recursively has to be the same to return true. If one of the attributes is an array, then it will sort in both class, so the order doesn't matter.

#### Example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

const bookValues = {
	_class: 'Book',
	title: 'New book',
	pages: 366
};

var book = new Book(bookValues),
	book2 = new Book(bookValues);

console.log(book.equals(book2)); // true
```

### class.validate(validationMode)

It's the validation function. It runs automaticaly right after the constructor, update and values setter functions. It returns the error object. If everything is fine, this object is empty. The validate function has an argument, that changes the validator mode temporaly. (It's a good practice that if you init your class with normal mode, and you run the validator in strict mode whenever you needed it) For the details, check the 'Validation' part of this readme.

#### Example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

var book = new Book({
	_class: 'Book',
	title: 'New book',
	pages: 366
});

try {
	book.validate('strict'); // true
} catch (err) {
	console.error(err.name, err.message);
}
```

### class.hasErrors()

It check if the class's values has any errors. It returns true, if one or more errors occured. It always run a validate() function in 'normal' mode for the check, so it won't throws exceptions.

#### Example

```javascript
var model = require('abstract-model'),
	Book = require('./models/book');

model.init({
	modelRoot: './models'
});

var book = new Book({
	_class: 'Book',
	title: 'New book',
	pages: 366
});

console.log(book.hasErrors()); // false
```

## Working example:

Check local-store.js under the example folder.