function Frame(document, meshes) {
	function readMatrix(node) {
		var matrix = OOGL.Matrix4.IDENTITY;
		document.queryNodes(node, './lookat | ./matrix | ./translate | ./rotate | ./scale | ./skew').forEach(function (node) {
			switch (node.tagName) {
			case 'lookat':
				throw 'not supported';
			case 'matrix':
				matrix = (new OOGL.Matrix4(document.queryFloatArray(node, '.'))).transpose().multiply(matrix);
				break;
			case 'translate':
				var offset = document.queryFloatArray(node, '.');
				matrix = new OOGL.TranslationMatrix4(offset[0], offset[1], offset[2]).multiply(matrix);
				break;
			case 'rotate':
				var parameters = document.queryFloatArray(node, '.');
				matrix = new OOGL.RotationMatrix4(parameters[0], parameters[1], parameters[2], parameters[3] * Math.PI / 180).multiply(matrix);
				break;
			case 'scale':
				var factors = document.queryFloatArray(node, '.');
				matrix = new OOGL.ScalingMatrix4(factors[0], factors[1], factors[2]).multiply(matrix);
				break;
			case 'skew':
				throw 'not supported';
			}
		});
		return matrix;
	}

	function Node(node) {
		var id = document.queryString(node, 'substring(./instance_geometry/@url, 2)');
		var matrix = readMatrix(node);
		var move = false;

		var mesh = meshes[id];

		this.toggle = function (test) {
			if (!test || (id === test) || test.test(id)) {
				move = !move;
			}
		};

		this.draw = function (program, baseMatrix) {
			if (move) {
				mesh.draw(program, baseMatrix.by(matrix));
			} else {
				mesh.draw(program, OOGL.Matrix4.IDENTITY);
			}
		};
	}

	function Joint(node) {
		var id = document.queryString(node, './@id');
		var matrix = readMatrix(node);

		var nodes = document.queryNodes(node,
'./node[\
	@type = \"NODE\"\
]'
			).map(function (node) {
				return new Node(node);
		});

		var joints = document.queryNodes(node,
'./node[\
	@type = \"JOINT\"\
]'
			).map(function (node) {
				return new Joint(node);
		});

		this.toggle = function (test) {
			if (test && (id !== test) && !test.test(id)) {
				nodes.forEach(function (node) {
					node.toggle(test);
				});
				joints.forEach(function (joint) {
					joint.toggle(test);
				});
			} else {
				nodes.forEach(function (node) {
					node.toggle();
				});
				joints.forEach(function (joint) {
					joint.toggle();
				});
			}
		};

		this.draw = function (program, baseMatrix) {
			var finalMatrix = baseMatrix.by(matrix);
			nodes.forEach(function (node) {
				node.draw(program, finalMatrix);
			});
			joints.forEach(function (joint) {
				joint.draw(program, finalMatrix);
			});
		}
	}

	var roots = document.queryNodes('/COLLADA/library_visual_scenes/visual_scene').map(function (node) {
		return new Joint(node);
	});

	this.toggle = function (test) {
		roots.forEach(function (node) {
			node.toggle(test);
		});
	};

	this.draw = function (program) {
		roots.forEach(function (node) {
			node.draw(program, OOGL.Matrix4.IDENTITY);
		});
	};
}
