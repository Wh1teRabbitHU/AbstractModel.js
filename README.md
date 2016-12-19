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
	title: 'String', // String-type attribute description
	name: { // Object-type attribute description
		type: 'String',
		max: 20,
		required: true
	}
}
```

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

### Constructor

What's the constructor's job?
It sets your predefined attributes to the class, initialize the given values (if nothing is added, then skip this part) and validate them. If the validator is in the 'strict' mode and find some inconsistence, it throws an error. (Its all after the update, so your values are updated, but they wont be valid)

```javascript
var book = new Book();

```

### Parsing json object

### Validation

### Checking equality

## Working example:

Check local-store.js under the example folder.