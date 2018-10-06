# AbstractModel.js

![badge-licence](https://img.shields.io/github/license/Wh1teRabbitHU/AbstractModel.js.svg)
![badge-release](https://img.shields.io/github/package-json/v/Wh1teRabbitHU/AbstractModel.js.svg)
![badge-travis](https://img.shields.io/travis/Wh1teRabbitHU/AbstractModel.js.svg)
![badge-npm-bundle-size-minified](https://img.shields.io/bundlephobia/min/abstract-model.svg)
![badge-npm-bundle-size-minified-gzip](https://img.shields.io/bundlephobia/minzip/abstract-model.svg)

## Bookmarks

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
	- [Register classes](#registering-classes)
	- [Attributes](#attributes)
	- [Create a class](#create-a-class)
	- [Parsing json Object](#parsing-json-object)
	- [Validation](#validation)
- [Module methods](#module-methods)
	- [abstractModel.registerClass(class, alias, ignoreDuplicate)](#abstract-model-register-class)
	- [abstractModel.parseObject(object, class)](#abstract-model-parse-object)
	- [abstractModel.isClassRegistered(alias)](#abstract-model-is-class-registered)
	- [abstractModel.dropRegisteredClasses()](#abstract-model-drop-registered-classes)
	- [abstractModel.Class](#abstract-model-class)
- [Class methods](#class-methods)
	- [Constructor](#constructor)
	- [class.update(values)](#class-update)
	- [class.values](#class-values)
	- [class.equals(otherClass)](#class-equals)
	- [class.validate(validationMode)](#class-validate)
	- [class.hasErrors()](#class-haserrors)
	- [class.clone()](#class-clone)
- [Working example](#working-example)
- [Changelogs](#changelogs)

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

### <a id="registering-classes"></a> Registering classes

Before you can use the parser function, you must register all your model classes. However, if you wont use the parser, you can skip the registration entirely.
Example code:

```javascript
const model = require('abstract-model');
const Book  = require('./models/book');

model.registerClass(Book);

let bookInstance = model.parseObject({
	_class: 'Book',
	title: 'Dune',
	author: 'Arthur C. Clarke',
	release: 1965,
	tags: [ 'Sci-fi', 'Drama', 'Space' ],
	pages: 534
});
```

### <a id="attributes"></a> Attributes

The following types are available:

- String
- Number
- Boolean
- Object
- _Or any extension of the abstract-model class_

You can use arrays as attributes, too. The syntax is similar, but you have to put the type inside an array. Only one type allowed! Examples:

- [ String ]
- [ Number ]
- [ Boolean ]
- [ Object ]
- [ _Or any extension of the abstract-model class_ ]

#### How to define the attributes?

When you create a new class, you have to give the attributes to its super constructor. This is an Object type variable, and the keys are your attribute names. The value is the type of the attribute or if you need some validation rules then Object. (You must provide every necessary options when you use this option) After you initialized the class, the attributes are converted into the Object-type form and stored in the '_attributes' inner variable. (The direct type declaration is just a shortcut)
When you provide Object, the following options are available:

- type: Type of the attribute. The format is the same used in the shortcuts.
- isArray: If the attribute is an array, then its true.
- Validation rules: See the ['validation'](#validation) section.

Examples:

```javascript
const Worker = require('./worker');
const CLASS_ATTRIBUTE = {
	title: String, 	// String-type attribute description
	name: { 			// Object-type attribute description
		type: String,
		isArray: false,
		max: 20,
		required: true
	},
	tags: [ String ],
	colleagues: {
		type: Worker,
		isArray: true
	}
}
```

#### Inner attributes

The abstract class has a few inner attributes. You shouldn't change them manualy for security and reliability reasons. Every inner attribute starts with an underscore.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _class | String | The class's own name and/or the given alias. By default it's the class's name, but when you register a class for parsing, you can provide an alias for the specific instance. It can be handy, when you have multiple classes with the same name. |
| _attributes | Object | After you create a class it will contains all the predefined attributes. Inner attributes are excluded. |
| _errors | Object | It contains those attributes that failed during the validation process. Every key is an attribute name and the value pair is an array with the errors. |

### <a id="create-a-class"></a> Create a class

To extend and use your class, you won't need any special setup. In the constructor you have to pass the class attributes and the initializer values. (the attributes are required it will throw an exception if missing. The values are just recommended)

```javascript
const model = require('abstract-model');
const Book  = require('./book');

const attributes = {
	stringAttr: String,
	numberAttr: {
		type: Number,
		isArray: false,
		max: 100,
		required: true
	},
	booleanAttr: Boolean,
	objectAttr: Object,
	arrayAttr: [ String ],
	bookAttr: Book
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

The module has a parser function, too. You can parse any object to all the defined and registered classes. The given object has to have a '_class' attribute to identify the target class. If its missing or the class cannot be located, the parser throws an error. Alternatively you can provide a class object to the parser function. If you give both class object and '_class' attribte, then the object will be used. See more details at the [methods](#abstract-model-parse-object) section

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

## <a id="module-methods"></a> Module methods

Its all the modules functionality. You can call all these functions directly from the module instace.

### <a id="abstract-model-register-class"></a> abstractModel.registerClass(class, alias, ignoreDuplicate)

This method helps you with parsing as it preregister all the later-used classes. You can link an alias to your class, so it can be easily registered two class objects with the same name. If the alias parameter is absent, then the class objects name will be the alias. By default if you try to register a class twice with the same alias, it will throw an AlreadyRegisteredException. If you need to overwrite a registered object, you can do it with the third parameter.

```javascript
const model = require('abstract-model');
const Book  = require('./models/book');

const bookAlias = 'bookAlias';


model.registerClass(Book);
model.registerClass(Book, bookAlias);
model.registerClass(Book, bookAlias, true); // overwrite the previous registration on the 'bookAlias' alias

```

### <a id="abstract-model-parse-object"></a> abstractModel.parseObject(object, class)

This method help you with parsing simple javascript objects into a class instance. Either you provide a class object as the second parameter for this method or it can find automatically in the already registered class list. (In this case the praseable object has to contains one attribute to determine which class needed to load by the parser. This attributes name is '_class') In both cases you can gave an alias or a class object to this method.

```javascript
const model = require('abstract-model');
const Book  = require('./models/book');

const bookAlias = 'bookAlias';

const bookValues = {
	_class: Book,
	title: 'New book',
	pages: 366
};
const bookValuesWithAlias = {
	_class: bookAlias,
	title: 'New book',
	pages: 366
};
const bookValuesWithoutClassAttribute = {
	title: 'New book',
	pages: 366
};

model.registerClass(Book);
model.registerClass(Book, bookAlias);

var book  = model.parseObject(bookValues),
	book2 = model.parseObject(bookValuesWithAlias),
	book3 = model.parseObject(bookValuesWithoutClassAttribute, Book),
	book4 = model.parseObject(bookValuesWithoutClassAttribute, bookAlias),
	book5 = new Book(bookValues);

console.log(book.equals(book2)); // true
console.log(book2.equals(book3)); // true
console.log(book3.equals(book4)); // true
console.log(book4.equals(book5)); // true
```

### <a id="abstract-model-is-class-registered"></a> abstractModel.isClassRegistered(alias)

It checks if the given alias or class object already registered. If you call this method without any input parameter or with a bad parameter type, it will throw an error!

```javascript
const model = require('abstract-model');
const Book  = require('./models/book');

const bookAlias = 'bookAlias';
const bookAlias2 = 'bookAlias2';

model.registerClass(Book);
model.registerClass(Book, bookAlias);

console.log(model.isClassRegistered(Book)); // true
console.log(model.isClassRegistered(bookAlias)); // true
console.log(model.isClassRegistered(bookAlias2)); // false
```

### <a id="abstract-model-drop-registered-classes"></a> abstractModel.dropRegisteredClasses()

This method drops all the previously registered classes.

```javascript
const model = require('abstract-model');
const Book  = require('./models/book');

const bookAlias = 'bookAlias';

model.registerClass(Book);
model.registerClass(Book, bookAlias);

console.log(model.isClassRegistered(Book)); // true
console.log(model.isClassRegistered(bookAlias)); // true

model.dropRegisteredClasses();

console.log(model.isClassRegistered(Book)); // false
console.log(model.isClassRegistered(bookAlias)); // false
```

### <a id="abstract-model-class"></a> abstractModel.Class

This is the abstract class object. When you create a new class, you have to extend with this object. Also you must provide the constructor with the classes attributes. This class has all the methods and functionality disgusted in the next section.

```javascript
const model = require('abstract-model');
const Book  = require('./book');

const attributes = {
	stringAttr: String,
	numberAttr: {
		type: Number,
		isArray: false,
		max: 100,
		required: true
	},
	booleanAttr: Boolean,
	objectAttr: Object,
	arrayAttr: [ String ],
	bookAttr: Book
};

class AllTypeClass extends model.Class {

	constructor(values) {
		super(attributes, values);
	}

}
```

## <a id="class-methods"></a> Class methods

### <a id="constructor"></a> Constructor

What's the constructor's job?
It sets your predefined attributes to the class, initialize with the given values (if nothing is added, then skipping this part) and validate them. The constructor also set the '_class' attribute whenever you provide it or not. You should define this attribute inside the other attributes object. If you didn't add any specific value, the default will be the classes name.

```javascript
const Book = require('./models/book');

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
const Book = require('./models/book');

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
const Book = require('./models/book');

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
const Book = require('./models/book');

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

It's checking if your class is equals to the other class. The given attributes and all the values recursively has to be the same to return true. If one of the attributes is an array, then it will sort in both class, so the order doesn't matter in the result.

#### Example

```javascript
const Book = require('./models/book');

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

It's the validator function. It runs automaticaly right after the constructor, update and 'values' setter functions. It returns an object with all the found errors. If everything is fine, this object is empty. The validate function has an argument, that changes the validator's mode temporarily. (It's a good practice that if you init your class with normal mode, and you run the validator in strict mode whenever you need it) For the details, check the ['Validation'](#validation) part.

#### Example

```javascript
const Book = require('./models/book');

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
const Book = require('./models/book');

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
const Book = require('./models/book');

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

## <a id="changelogs"></a> Changelogs

### 1.0.1

- Adding '_class' attribute initializer to the constructor. If the '_class' attribute not provided with the other attributes, then the constructor will set as the classes name.
- Adding travis support
- Adding README badges

### 1.0.0

- Huge refactor. Most functionalities are separated into different files. More readable code, less workaround and spagetti.
- Changing the type declaration from strings to objects. It helps when using in browser. (it will automatically include all the needed class declarations if you use browserify or webpack)
- Removing folder scans and recursive scanning. (no more need for that) What is left is the class registration for the parser object and some handy methods.
- More simpler and easy-to-use parser without any initialization required. More options for the parser.
- Revisited unit tests, all functionality covered

### 0.1.3

- Minor fixes. Now you can pass null as 'values'. In the following cases:
	- The update function now do nothing. (previously it's just crashed)
	- The 'values' setter clears all the values assigned to the model instance.
- Removed 'fs' module, because Browserify is not entirely support its functionality so it had to go. Although It's still not working fully with client side packagers. (It's a future plan to fix entirely)

### 0.1.2

- All attributes are now converted into object type. It makes the code a bit more readable and now its a bit easier to follow the changes of the instance's inner attributes.
- New global function: 'clone(obj)'. It creates an other instance with the given instance values, recursively. (every sub-models and arrays are cloned also as a new instance)
- The abstract model also has this function: 'clone()'. Same as the global one, it makes a new copy from the model instance, recursively.

### 0.1.1

- Updated 'values' getter. It's now recursively filters the object's values. No longer leave the sub-model's inner attributes in the returned value object.

### 0.1.0

- First bigger release. The implemented functions are (hopefully :) ) working and all the functionality has unit test cases.