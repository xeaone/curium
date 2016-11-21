
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

var isUrl = new RegExp('(^https?:\\/\\/)|(^\\/[^\\/\\*])|(^\\.\\/)', 'i');
var isHtml = new RegExp('(^<.*?>)', 'i');

/*
	main
*/

function Component (opt) {
	var self = {};

	if (!opt) throw new Error('Curium.component: missing options');
	if (!opt.tag) throw new Error('Curium.component: missing tag');

	if (!opt.template) {
		self.template = document.createElement('template');
	} else if (opt.template.constructor.name === 'Function') {
		self.template = toDom(opt.template);
	} else if (opt.template.constructor.name === 'String') {
		if (isUrl.test(opt.template)) {
			self.template = null;
		} else if (isHtml.test(opt.template)) {
			self.template = toDom(opt.template);
		} else {
			self.template = document._currentScript.ownerDocument.querySelector(opt.template);
		}
	} else {
		self.template = opt.template;
	}

	if (opt.proto) opt.proto = Object.create(opt.proto);
	else opt.proto = Object.create(HTMLElement.prototype);

	self.model = opt.model || {};
	self.controller = opt.controller || {};
	self.element = document.querySelector(opt.tag);
	self.attribute = getAttributeObject(self.element, {});

	opt.proto.attachedCallback = function () {
		if (opt.attached) opt.attached(self);
	};

	opt.proto.detachedCallback = function () {
		if (opt.detached) opt.detached(self);
	};

	opt.proto.attributeChangedCallback = function (name, oldValue, newValue) {
		if (opt.attributed) opt.attributed(self, name, oldValue, newValue);
	};

	opt.proto.createdCallback = function () {
		var element = this;

		if (self.template) {
			if (opt.created) opt.created(self);
			element.appendChild(document.importNode(self.template.content, true));
		} else if (opt.template) {
			getTemplateUrl(opt.template, function (data) {
				self.template = toDom(data);
				if (opt.created) opt.created(self);
				element.appendChild(document.importNode(self.template.content, true));
			});
		} else if (opt.created) {
			opt.created(self);
		}
	};

	document.registerElement(opt.tag, {
		prototype: opt.proto,
		extends: opt.extends
	});

	return self;
}

/*
	assign
*/

if (!window.Curium) {
	window.addEventListener('DOMContentLoaded', function () {
		document.body.style.opacity = 0; // hide body
	});

	window.addEventListener('WebComponentsReady', function() {
		document.body.style.opacity = 1; // show body
	});

	window.Curium = {
		components: {},
		component: function (opt) {
			this.components[opt.tag] = Component(opt);
			return this.components[opt.tag];
		},
		query: function (query) {
			return document._currentScript.ownerDocument.querySelector(query);
		},
		script: function () {
			return document._currentScript;
		},
		document: function () {
			return document._currentScript.ownerDocument;
		}
	};
}
