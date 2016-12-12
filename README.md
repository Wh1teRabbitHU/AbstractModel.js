# AbstractModel.js

## Description

It's an abstract model class with some basic functionality and validation tools. You can predefine all the attributes your class will ever use and the update function will take care of the rest. If your data structure needs validation, you can easily predefine some simple rules, too. Also you can parse any json objects and create an extended class instance with the module's parse function. Thanks to that you get an easy way to handle the client-server communications and data transfers. After you sent or received your data, you call the parser and it returns the class with all the functions, attributes and validators that you created.

## Installation

```
npm install abstract-model --save
```

## Usage

Before you do anything with your classes, you must initialize the abstract-class module. For now, only one option parameter is required, the 'modelRoot':

```javascript
var model = require('abstract-model');

model.init({
	modelRoot: './example/models'
});
```
This attrbute tells the class that where it find your classes. After this initialization, if you pass a json object with an '_class' attribute to the parser, then it'll automaticly create the target class instance and fill with the given values. If your model classes are separately structured, you also have to concat the subfolder's path to this attribute.

Example folder structure for this scenario:

- ./models/library/book.js
- ./models/library/category.js
- ./models/library/shelf.js
- ./models/account/transport.js
- ./models/account/bill.js
- ./models/message.js

If you want to use all of your models, then the modelRoot value will be './models' and the '_class' values are:

- library/book
- library/category
- library/shelf
- account/transport
- account/bill
- message

### Attributes

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

### Create a class

To extend and use your class, you won't need any special. In the constructor you have to pass the class attributes and the initializer values. Example:

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

And thats all! You can use it now! You can pass any object to the constructor (or the update function in any existing class) and it will only update the predefined attributes. If you have like 10 attributes, but your class defined with one title, then the update function only set the title, if its present in the values object. But beware, if one of the values has different type than the one in the class with the same name, then it will throw an InvalidTypeException right after you try to update your class. There is only two exceptions:

- If the value is null
- Or its a single item, but you defined an array, then it will be added to an empty array and set for your class.

```javascript

```

### Parsing json object

### Validation

### Checking equality

## Syntax

```javascript
routing(paths, router, params);
```

## Working example:

Check local-store.js under the example folder.