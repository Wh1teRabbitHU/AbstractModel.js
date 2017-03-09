# AbstractModel.js

## Bookmarks

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
	- [Initialization](#initialization)
	- [Attributes](#attributes)
	- [Create a class](#create-a-class)
	- [Parsing json Object](#parsing-json-object)
	- [Validation](#validation)
- [Methods](#methods)
	- [Constructor](#constructor)
	- [class.update(values)](#class-update)
	- [class.values](#class-values)
	- [class.equals(otherClass)](#class-equals)
	- [class.validate(validationMode)](#class-validate)
	- [class.hasErrors()](#class-haserrors)
	- [class.clone()](#class-clone)
- [Working example](#working-example)

## <a id="description"></a> Description

It's an abstract model class with some basic functionality and validation tools. You can predefine all the attributes your class will ever use and the update function will take care of the rest. If your data structure needs validation, you can easily predefine some simple rules, too. Also you can parse any json objects and create an extended class instance with the module's parse function. Thanks to that you get an easy way to handle client-server communications and data transfers. After you sent or received your data, you call the parser and it returns the class with all the functions, attributes and validators.

## <a id="installation"></a> Installation

You can simply install it via npm or clone from GitHub. In this case you should require the ./index.js or the ./lib/abstract-model.js file to use the module.

```bash
# Install via npm
npm install abstract-model --save

# Clone from Github
cd path/to/target/folder
git clone https://github.com/Wh1teRabbitHU/AbstractModel.js.git
```

## <a id="usage"></a> Usage

### <a id="initialization"></a> Initialization

Before you do anything with your classes, you must initialize the abstract-model module:

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
| modelRoot | String | true | - | Path to your models. This attribute tells the class that where to find your model files. After the initialization, if you pass a json object to the parser with a '_class' attribute, then it'll automaticly create the target class instance and update with the given values. If your model classes are separately structured, you also have to concat the subfolder's path to this attribute. |
| validatonMode | String | false | 'normal' | It define, how the validator handle the errors. There are two available values: 'normal', 'strict'. If the validator is in the 'strict' mode, the update function will throws exception if found an error. In normal mode it'll only fill the errors object, so you have to retrieve it ('_errors') or manualy validate the class later |

Example folder structure:

| Model path | '_class' value |
| ---------- | -------------- |
| ./models/library/book.js | 'library/book' |
| ./models/library/category.js | 'library/category' |
| ./models/library/shelf.js | 'library/shelf' |
| ./models/account/transport.js | 'account/transport' |
| ./models/account/bill.js | 'account/bill' |
| ./models/message.js | 'message' |

### <a id="attributes"></a> Attributes

The following types are available:

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

When you create a new class, you have to give the attributes to its super constructor. This is an Object type variable, and the keys are your attribute names. The value can be String (and it will be the type name of the attribute) or if you need some validation rules then Object. In this case, the type will be an attribute named to 'type'. After you initialized the class, the attributes are converted into the Object-type form and stored in the '_attributes' inner variable. (The string-type is just a shortcut)

Examples:

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

The abstract class has a few inner attributes. You shouldn't change them manualy for security and reliability reasons. Every inner attribute starts with an underscore.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _class | String | The class's own name and/or path to the declaration. By default it's the class's name, but when you try to parse a simple Object or just using a different name/path, then you have to provide it in the values. You can also use this attribute with direct/full path. |
| _attributes | Object | After you create a class it will contains all the predefined attributes. Inner attributes are excluded. |
| _errors | Object | It contains those attributes that failed during the validation process. Every key is an attribute name and the value pair is an array with the errors. |

### <a id="create-a-class"></a> Create a class

To extend and use your class, you won't need any special thing. In the constructor you have to pass the class attributes and the initializer values.

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

And thats all, you can use it now! Pass any object to the constructor (or the update function in any existing class instance) and it will only update the predefined attributes. If the value's object have like 10 attributes, but your class defined with one 'title', then the update function only set the 'title' (if its present) and leave the rest. But beware, if one of the values has different type than it initialized in the class, then it will throw an InvalidTypeException while you try to update your values. There is only two exceptions:

- If the value is null
- Or its a single item, but you defined an array, then it will be added to an empty array and set to your class.

### <a id="parsing-json-object"></a> Parsing json object

The module has a parser function, too. You can parse any object to an already defined class. The given object has to have a '_class' attribute to identify the target class. If its missing or the class cannot be located, the parser throws an error.

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

### <a id="validation"></a> Validation

Every time the class's values are changed, the validate function will run. It has two mode: 'normal' (this is the default) and 'strict'. In 'normal' mode, all the attributes are checked and an Object type variable returns with all the validation errors. In 'strict' mode if the validator find an error, it throws an exception and the validate function stops. The validation rules are defined in the attribute's definitons, so after you create the class, it cannot be changed.

The following rules are available:

| Name | Types | Description |
| ---- | ----- | ----------- |
| min | Number | Checking if the given min number is smaller than the attribute's value. It's inclusive, so it only throws error if the value is smaller. |
| max | Number | Checking if the given max number is larger than the attribute's value. It's inclusive, so it only throws error if the value is larger. |
| length | String | Checking if the given length is larger than the attribute's length. It's inclusive, so it only throws error if the string is longer. |
| required | All | Checking if the attribute is given. It throws error if the value is null or undefined |
| values | Number, String | Checking if the value can be found in the values array. The 'values' rule's value must be an array or it'll throws an Exception |
| regexp | String | Checking if the value is matching with the given regular expression. (Using the [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) object) The given patter will be passed as an argument to the RegExp global object's constructor |
| custom | All | Checking if the value is passing the predefined custom validator function. It has one input parameter, the attribute's value and it must return with the validation result (Boolean) |

## <a id="methods"></a> Methods

### <a id="constructor"></a> Constructor

What's the constructor's job?
It sets your predefined attributes to the class, initialize with the given values (if nothing is added, then skipping this part) and validate them. If the validator is in the 'strict' mode and find some inconsistence, it throws an error. (Runs after the update function, so it sets your values anyway)

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

### <a id="class-update"></a> class.update(values)

This function updates the class with the given values. It'll skip those attributes that not represented in the class. If one of the values has a different type than the class's predefined attribute has, then it throws an exception. The update function automatically validate the new values after all values are set. In 'strict' mode if one of the validation fails, it throws an exception.

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

### <a id="class-values"></a> class.values

Every class has a values attribute with both getter and setter. When you retreive your values, it only returns the predefined attributes without the inner ones. If an attribute has no value, then it still included in the returned object as 'undefined'. If the given object has more attributes than the class has, the setter ignore those are missing from the class. The only different between the update function and this is if you use the setter it will change all the previous values, not just the new ones.

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

### <a id="class-equals"></a> class.equals(otherClass)

It's checking if your class is equals to the other class. The class name/path, the given attributes and all the values recursively has to be the same to return true. If one of the attributes is an array, then it will sort in both class, so the order doesn't matter in the result.

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

### <a id="class-validate"></a> class.validate(validationMode)

It's the validation function. It runs automaticaly right after the constructor, update and 'values' setter functions. It returns an object with all the found errors. If everything is fine, this object is empty. The validate function has an argument, that changes the validator's mode temporarily. (It's a good practice that if you init your class with normal mode, and you run the validator in strict mode whenever you need it) For the details, check the ['Validation'](#validation) part.

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

### <a id="class-haserrors"></a> class.hasErrors()

Checking if the class's values has any errors. Returns true, if one or more errors occured. It always run the validate() function in 'normal' mode, so it won't throws any exceptions.

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

### <a id="class-clone"></a> class.clone()

It makes a new, standalone instance from this entity. The values are identical, but the variable pointers are different. Every objects, arrays and primitive types gets a new instance, recursively.

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

var otherBook = book.clone();

otherBook.title = 'Old book';

console.log(book.title); // It's still 'New book', no matter what you are going to do with the otherBook!
```

## <a id="working-example"></a> Working example:

Check local-store.js under the example folder. Later I'll make an interactive page to play with the data.