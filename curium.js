'use strict';

(function () {

	window.addEventListener('DOMContentLoaded', function () {
		document.body.style.opacity = 0; // hide body
	});

	window.addEventListener('WebComponentsReady', function() {
		window.dispatchEvent(new CustomEvent('CuriumLoaded'));
		document.body.style.opacity = 1; // show body
	});

	/*
		Component
	*/
	function Component (tag, options) {
		var self = this;

		self.tag = tag;

		if (isEmpty(options)) options = {};

		if (isTemplate(options.template)) { self.template = options.template; }
		else if (isEmpty(self.template)) { self.template = document._currentScript.ownerDocument.querySelector('template'); }
		else if (isString(options.template)) { self.template = document.createElement('template'); self.template.innerHTML = options.template; }
		else if (isFunction(options.template)) { self.template = document.createElement('template'); self.template.innerHTML = multilineParse(options.template); }

		self.templateContent = self.template.content;

		self.element = Object.create(HTMLElement.prototype);
		self._attributes = getAttributes(self.tag);

		if (options.attached) self.element.attachedCallback = options.attached;
		if (options.detached) self.element.detachedCallback = options.detached;
		if (options.attributed) self.element.attributeChangedCallback = options.attributed;
		if (options.attributes) options.attributes(self._attributes);

		self.element.createdCallback = function () {
			if (options.created) self.templateContent = options.created(self.templateContent) || self.templateContent;

			// this refers to the target element
			this.appendChild(document.importNode(self.templateContent, true));
		};

		// register must be last
		document.registerElement(self.tag, {
			prototype: self.element,
			extends: options.extends
		});
	}

	/*
		Assign
	*/
	window.Curium = {
		components: [],
		component:  function (name, options) {
			var component = new Component(name, options);
			this.components.push(component);
			return component;
		}
	};

	/*
		Internal
	*/
	function multilineParse(fn) {
		var multilineComment = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;
		return typeof fn === 'function' ? multilineComment.exec(fn.toString())[1] : fn;
	}

	function getAttributes (query) {
		var attributesOld = document.querySelector(query).attributes;
		var attributesNew = {};

		if (attributesOld.length > 0) {
			var l = attributesOld.length;
			var i = 0;
			var name = null;
			var value = null;

			for (i; i < l; i++) {
				name = attributesOld[i].name;
				value = attributesOld[i].value;

				name = (name.search('-') === -1) ? name : toCamelCase(name);

				attributesNew[name] = value;
			}
		}

		return attributesNew;
	}

	function toCamelCase (string) {
		var nextIndex = string.search('-') + 1;
		var nextLetter = string.charAt(nextIndex).toString();
		var r = '-' + nextLetter;
		var n = nextLetter.toUpperCase();
		return string.replace(r, n);
	}

	function fromCamelCase (string) {
		var firstChar = string.charAt(0).toString();

		string = string.replace(firstChar, firstChar.toLowerCase());

		// replace upper case with hypeh and lower cased char
		for (var i = 0; i < string.length; i++) {
			var char = string[i];
			if (isUpperCase(char)) string = string.replace(char, '-' + char.toLowerCase());
		}

		return string;
	}

	function isUpperCase (char) {
		return (char >= 'A') && (char <= 'Z');
	}

	function isTemplate (value) {
		if (value === null || value === undefined) return false;
		else return value.constructor === HTMLTemplateElement;
	}

	function isEmpty (value) {
		return value === null || value === undefined;
	}

	function isObject (value) {
		if (value === null || value === undefined) return false;
		else return value.constructor === Object;
	}

	function isString (value) {
		if (value === null || value === undefined) return false;
		else return value.constructor === String;
	}

	function isFunction (value) {
		if (value === null || value === undefined) return false;
		else return value.constructor === Function;
	}

})();
