function QueryableDocument(document) {
	function query(node, xpath, type) {
		if (!xpath) {
			xpath = node;
			node = document;
		}
		return document.evaluate(xpath, node, null, type, null);
	}

	this.queryBoolean = function (node, xpath) {
		return query(node, xpath, XPathResult.BOOLEAN_TYPE).booleanValue;
	};

	this.queryNumber = function (node, xpath) {
		return query(node, xpath, XPathResult.NUMBER_TYPE).numberValue;
	};

	this.queryString = function (node, xpath) {
		return query(node, xpath, XPathResult.STRING_TYPE).stringValue;
	};

	this.queryFloatArray = function (node, xpath) {
		return query(node, xpath, XPathResult.STRING_TYPE).stringValue
			.replace(/^\s+/, '')
			.replace(/\s+$/, '')
			.split(/\s+/)
			.map(parseFloat);
	};

	this.queryIntArray = function (node, xpath) {
		return query(node, xpath, XPathResult.STRING_TYPE).stringValue
			.replace(/^\s+/, '')
			.replace(/\s+$/, '')
			.split(/\s+/)
			.map(function (string) {
				return parseInt(string, 10);
		});
	};

	this.queryNodes = function (node, xpath) {
		var iterator = query(node, xpath, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
		var nodes = [];
		for (var node = iterator.iterateNext(); node; node = iterator.iterateNext()) {
			nodes.push(node);
		}
		return nodes;
	};

	this.forEachNode = function (node, xpath, callback) {
		if (!callback) {
			callback = xpath;
			xpath = null;
		}
		var iterator = query(node, xpath, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
		for (var node = iterator.iterateNext(); node; node = iterator.iterateNext()) {
			if (callback(node) === false) {
				return true;
			}
		}
		return false;
	};

	this.queryNode = function (node, xpath) {
		return query(node, xpath, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
	};
}
