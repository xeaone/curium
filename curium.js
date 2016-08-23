(function () {
	'use strict';

	window.addEventListener('DOMContentLoaded', function () {
		document.body.style.opacity = 0; // hide body
	});

	window.addEventListener('WebComponentsReady', function() {
		document.body.style.opacity = 1; // show body
	});

	/*
		component
	*/
	function Component (options) {
		var self = {};

		if (!options) throw new Error('Curium.component: options missing');

		if (options.templateUrl) self.template = options.templateUrl;
		else if (options.templateElement) self.template = options.templateElement;
		else if (options.templateString) self.template = toDom(options.templateString);
		else if (options.templateMultiline) self.template = toDom(options.templateMultiline);
		else if (options.templateQuery) self.template = document._currentScript.ownerDocument.querySelector(options.templateQuery);

		self.tag = options.tag;
		self.extends = options.extends;
		self.element = document.querySelector(self.tag);
		self.proto = Object.create(HTMLElement.prototype);
		self.attribute = getAttributeObject(self.element, {});

		self.proto.createdCallback = function () {
			var element = this;

			if (options.templateUrl) {
				getTemplateUrl(options.templateUrl, function (data) {
					self.template = toDom(data);

					if (options.created) options.created(self);
					element.appendChild(document.importNode(self.template.content, true));
				});
			}
			else {
				if (options.created) options.created(self);
				element.appendChild(document.importNode(self.template.content, true));
			}
		};

		self.proto.attachedCallback = function () {
			if (options.attached) options.attached(self);
		};

		self.proto.detachedCallback = function () {
			if (options.detached) options.detached(self);
		};

		self.proto.attributeChangedCallback = function (name) {
			if (options.attributed) options.attributed(self, name);
		};

		document.registerElement(self.tag, {
			prototype: self.proto,
			extends: self.extends
		});

		return self;
	}

	/*
		assign
	*/
	window.Curium = {
		component: Component
	};

	/*
		internal
	*/

	function getTemplateUrl (path, callback) {
		var xhr = new XMLHttpRequest();

		xhr.open('GET', path, true);
		xhr.onreadystatechange = onreadystatechange;
		xhr.send();

		function onreadystatechange () {
			if (xhr.readyState === xhr.DONE && xhr.status === 200) return callback(xhr.response);
			else if (xhr.readyState === xhr.DONE && xhr.status !== 200) throw new Error('getTemplateUrl: ' + xhr.status + ' ' + xhr.statusText);
		}
	}

	function multiline(fn) {
		var multilineComment = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;

		if (typeof fn !== 'function') throw new TypeError('Multiline function missing');

		var match = multilineComment.exec(fn.toString());

		if (!match) throw new TypeError('Multiline comment missing');

		return match[1];
	}

	function getAttributeObject (element, attribute) {
		var attributes = element.attributes;
		var self = {};

		for (var c = 0; c < element.attributes.length; c++) {
			attribute[attributes[c].name] = attributes[c].value;
		}

		function options (name) {
			return {
				enumerable:true,
				configurable: true,
				get: function () {
					return attribute[name];
				},
				set: function (value) {
					attribute[name] = value;
					element.setAttribute(name, value);
				}
			};
		}

		for (var i = 0; i < attributes.length; i++) {
			var name = attributes[i].name;
			Object.defineProperty(self, name, options(name));
		}

		return self;
	}

	function toDom (data) {
		if (typeof data === 'function') data = multiline(data);
		var container = document.createElement('container');
		container.innerHTML = data;
		return container.children[0];
	}

})();
