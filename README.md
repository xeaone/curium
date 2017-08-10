# Curium #

**Development moved [github.com/AlexanderElias/jenie](https://github.com/AlexanderElias/jenie)**

Curium is a custom web component library/framework. Curium has two main flavors **Curium** and **Curium + Swathe**. Curium is your main custom elements library similar to X-tag and Skate. Curium + Swathe is your custom components library plus fancy data binding features in which case it is more like Polymer but more performant and way way smaller.

Swathe Link: [github.com/AlexanderElias/swathe](https://github.com/AlexanderElias/swathe)


## Minified Sizes ##
- **Curium: 2.04 KB**
- **Curium + Swathe: 3.39 KB**
- X-tag: 13.7 KB
- Skate: 13.7 KB
- Polymer: varies on version but HUGE


## Browser Support ##
- Chrome
- Firefox
- IE 11+/Edge (IE 10 has flaky Mutation Observer)
- Safari 7+
- Safari (iOS 7.1)
- Chrome (Android)


## Usage ##
- Curium With Pollyfill - `curium.polly.min.js`. This version bundles [webcomponents-lite.js ]


## API ##

### Curium ###
Returns an instance of the Curium object.

**Properties**
- components: `Object`
- component: `Function`
- query: `Function`
- script: `Function`
- document: `Function`

### Curium.components ###
Returns an object with all the custom components by there custom tag name. Helps keep the global scope clean.

**Properties**
- tag
	- Curium.component


### Curium.component() ###
Returns a custom component object. Accepts an options object.

**Properties**
- template
- element
- attribute
- controller (If using Swathe it is a special Swathe controller otherwise it is just an object)
- model (If using Swathe it is a special Swathe model otherwise it is just an object)

**Required Options**
- tag: `String` *required* (Note must be of format `start-end`)

**Template Options**
- template: `HTMLElement` DOM element
- template: `String` string containing html (Note must begin with a html tag `<ANY-TAG>` even an html comment will work)
- template: `String` path to template using XHR (Note must begin with `./` , `/`, or `http`)
- template: `Function` multiline comment inside function `function () {/* <template>I can span multiple lines</template> */}`
- template: `String` querySelector on the current script (Note will not work if `Curium.component(options)` is wrapped by function such as event listener)

**Methods Options**
- created: `Function` callback fired when custom element is created. Parameter is it's self.
- attached: `Function` callback fired when custom element is created. Parameter is it's self.
- detached: `Function` callback fired when custom element is created. Parameter is it's self.
- attributed: `Function` callback fired when custom element is created. Parameter is it's self.


### Curium.query() ###
Query selector on the current scripts document. Essentially a wrapper for `document._currentScript.ownerDocument.querySelector(query)` but in the current html document.


### Curium.script() ###
Convenience and compatibility `document._currentScript`.


### Curium.document() ###
Convenience and compatibility `document._currentScript.ownerDocument`.


## Examples ##

**Basic**
```JavaScript
Curium.component({ tag: 'c-tag' });
```

**Life Cycle**
```JavaScript
Curium.component({
	tag: 'c-tag',
	created: function (self) {
		console.log('created');
		// manipulate self.template
	},
	attached: function (self) {
		console.log('attached');
		// if using XHR templates attached is fired before created other wise it is fired after created
	},
	detached: function (self) {
		console.log('detached');
		// fired when element is removed from DOM
	},
	attributed: function (self, name, oldValue, newValue) {
		console.log('attributed');
		// fired any time attribute changes
		// self.attribute an object that can set or get the target elements attributes
	}
});
```

**JS File**
```JavaScript

var templateString = '<template><p>templateString</p></template>';

var templateMultiline = function () {/*

	<template>
		<p>templateMultiline</p>
	</template>

*/};

Curium.component({
	tag: 'c-tag',
	template: './template.html', // path to template.html file
	template: templateString,
	template: templateMultiline,
});
```


**HTML File**
```HTML

<template>
	<p>templateQuery</p>
</template>

<script>
var templateElement = Curium.query('template');

Curium.component({
	tag: 'c-tag',
	template: 'template',
	template: templateElement,
});
</script>
```

## License ##
Licensed Under MPL 2.0

Copyright 2016 [Alexander Elias](https://github.com/AlexanderElias/)
