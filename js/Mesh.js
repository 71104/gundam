function Mesh(document, node, oogl) {
	var arrays = (function () {
		var positions = document.queryFloatArray(node,
'./source[\
	concat(\"#\", @id) = ../vertices/input[\
		@semantic = \"POSITION\"\
	]/@source\
]/float_array[\
	concat(\"#\", @id) = ../technique_common/accessor[\
		@stride = \"3\"\
	]/@source\
]'
			);
		var textureCoordinates = document.queryFloatArray(node,
'./source[\
	concat(\"#\", @id) = ../polylist/input[\
		@semantic = \"TEXCOORD\"\
	]/@source\
]/float_array[\
	concat(\"#\", @id) = ../technique_common/accessor[\
		@stride = \"2\"\
	]/@source\
]'
			);

		var counts = document.queryIntArray(node, './polylist/vcount');
		var indices = document.queryIntArray(node, './polylist/p');

		var stride = document.queryNumber(node, 'count(./polylist/input)');
		var positionOffset = parseInt(document.queryString(node,
'./polylist/input[\
	@semantic = \"VERTEX\"\
]/@offset'
			), 10);
		var textureCoordinateOffset = parseInt(document.queryString(node,
'./polylist/input[\
	@semantic = \"TEXCOORD\"\
]/@offset'
			), 10);

		var finalPositions = [];
		var finalTextureCoordinates = [];

		function pushVertex(i) {
			finalPositions.push(positions[indices[i + positionOffset] * 3]);
			finalPositions.push(positions[indices[i + positionOffset] * 3 + 1]);
			finalPositions.push(positions[indices[i + positionOffset] * 3 + 2]);
			finalTextureCoordinates.push(textureCoordinates[indices[i + textureCoordinateOffset] * 2]);
			finalTextureCoordinates.push(textureCoordinates[indices[i + textureCoordinateOffset] * 2 + 1]);
		}

		var i = 0;
		counts.forEach(function (count) {
			switch (count) {
			case 3:
				pushVertex(i);
				pushVertex(i + stride);
				pushVertex(i + stride * 2);
				break;
			case 4:
				pushVertex(i);
				pushVertex(i + stride);
				pushVertex(i + stride * 2);
				pushVertex(i + stride * 2);
				pushVertex(i + stride * 3);
				pushVertex(i);
				break;
			}
			i += stride * count;
		});

		var arrays = new oogl.AttributeArrays(finalPositions.length / 3);
		arrays.add3f(finalPositions);
		arrays.add2f(finalTextureCoordinates);
		arrays.enable();
		return arrays;
	})();

	this.draw = function (program, matrix) {
		program.uniformMat4('Matrix', matrix);
		arrays.bindAndPointer();
		arrays.drawTriangles();
	};
}
