function Frame(document, meshes) {
	function readMatrix(node) {
		var matrix = OOGL.Matrix4.IDENTITY.clone();
		document.queryNodes(node, './lookat | ./matrix | ./translate | ./rotate | ./scale | ./skew').forEach(function (node) {
			switch (node.tagName) {
			case 'lookat':
				throw 'not supported';
			case 'matrix':
				matrix.multiply((new OOGL.Matrix4(document.queryFloatArray(node, '.'))).transpose());
				break;
			case 'translate':
				var offset = document.queryFloatArray(node, '.');
				matrix.multiply(new OOGL.TranslationMatrix4(offset[0], offset[1], offset[2]));
				break;
			case 'rotate':
				var parameters = document.queryFloatArray(node, '.');
				matrix.multiply(new OOGL.RotationMatrix4(parameters[0], parameters[1], parameters[2], parameters[3] * Math.PI / 180));
				break;
			case 'scale':
				var factors = document.queryFloatArray(node, '.');
				matrix.multiply(new OOGL.ScalingMatrix4(factors[0], factors[1], factors[2]));
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
		var transform = OOGL.Matrix4.IDENTITY.clone();
		var mesh = meshes[id];

		this.transform = function (filter, transformationMatrix) {
			if ((filter === id) || filter.test && filter.test(id)) {
				matrix = transformationMatrix.by(matrix);
			}
		};

		this.setTransform = function (filter, transformationMatrix) {
			if ((filter === id) || filter.test && filter.test(id)) {
				transform = transformationMatrix.clone();
			}
		};

		this.draw = function (program, baseMatrix) {
			mesh.draw(program, baseMatrix.by(matrix).by(transform));
		};
	}

	function Joint(node) {
		var id = document.queryString(node, './@id');
		var matrix = readMatrix(node);
		var transform = OOGL.Matrix4.IDENTITY.clone();

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

		this.transform = function (filter, transformationMatrix) {
			if ((filter !== id) && (!filter.test || !filter.test(id))) {
				nodes.forEach(function (node) {
					node.transform(filter, transformationMatrix);
				});
				joints.forEach(function (joint) {
					joint.transform(filter, transformationMatrix);
				});
			} else {
				matrix = transformationMatrix.by(matrix);
			}
		};

		this.setTransform = function (filter, transformationMatrix) {
			if ((filter !== id) && (!filter.test || !filter.test(id))) {
				nodes.forEach(function (node) {
					node.setTransform(filter, transformationMatrix);
				});
				joints.forEach(function (joint) {
					joint.setTransform(filter, transformationMatrix);
				});
			} else {
				transform = transformationMatrix.clone();
			}
		};

		this.draw = function (program, baseMatrix) {
			var finalMatrix = baseMatrix.by(matrix).by(transform);
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

	this.transform = function (filter, matrix) {
		roots.forEach(function (node) {
			node.transform(filter, matrix);
		});
	};

	this.setTransform = function (filter, matrix) {
		roots.forEach(function (node) {
			node.setTransform(filter, matrix);
		});
	}

	this.draw = function (program) {
		roots.forEach(function (node) {
			node.draw(program, OOGL.Matrix4.IDENTITY);
		});
	};
}
