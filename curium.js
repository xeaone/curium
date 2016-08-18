
(function () {
	'use strict';

	window.addEventListener('DOMContentLoaded', function () {
		document.body.style.opacity = 0; // hide body
	});

	window.addEventListener('WebComponentsReady', function() {
		document.body.style.opacity = 1; // show body
	});

	/*
		Component
	*/
	function Component (options) {
		var self = this;

		if (!options) throw new Error('Curium.component: options missing');

		if (options.templateUrl) self.template = options.templateUrl;
		else if (options.templateElement) self.template = options.templateElement;
		else if (options.templateString) self.template = toDom(options.templateString);
		else if (options.templateMultiline) self.template = toDom(options.templateMultiline);
		else if (options.templateQuery) self.template = document._currentScript.ownerDocument.querySelector(options.templateQuery);

		self.tag = options.tag;
		self.extends = options.extends;
		self.attributes = getAttributes(self.tag);
		self.element = Object.create(HTMLElement.prototype);

		self.element.attachedCallback = options.attached;
		self.element.detachedCallback = options.detached;
		self.element.attributeChangedCallback = options.attributed;

		self.element.createdCallback = function () {
			if (options.templateUrl) return getTemplateUrl(self.template, self, this, options, callbackTemplateUrl);
			if (options.created) options.created(self.template.content, this);
			this.appendChild(document.importNode(self.template.content, true));
		};

		document.registerElement(self.tag, {
			prototype: self.element,
			extends: self.extends
		});
	}

	/*
		Assign
	*/
	window.Curium = {
		components: [],
		component:  function (options) {
			this.components.push(new Component(options));
			return this.components[this.components.length-1];
		}
	};

	/*
		Internal
	*/
	function callbackTemplateUrl (error, self, target, options, data) {
		self.template = toDom(data);

		if (options.created) options.created(self.template.content, target);
		target.appendChild(document.importNode(self.template.content, true));
	}

	function getTemplateUrl (path, self, target, options, callback) {
		var xhr = new XMLHttpRequest();

		xhr.open('GET', path, true);
		xhr.onreadystatechange = onreadystatechange;
		xhr.send();

		function onreadystatechange () {
			if (xhr.readyState === xhr.DONE && xhr.status === 200) return callback(null, self, target, options, xhr.response);
			else if (xhr.readyState === xhr.DONE && xhr.status !== 200) return callback(xhr);
		}
	}

	function multiline(fn) {
		var multilineComment = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;

		if (typeof fn !== 'function') throw new TypeError('Multiline function missing');

		var match = multilineComment.exec(fn.toString());

		if (!match) throw new TypeError('Multiline comment missing');

		return match[1];
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

	function toDom (data) {
		if (typeof data === 'function') data = multiline(data);
		var container = document.createElement('container');
		container.innerHTML = data;
		return container.children[0];
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

})();
