function Frame(document, meshes) {
	function readMatrix(node) {
		var matrix = OOGL.Matrix4.IDENTITY;
		document.queryNodes(node, './lookat | ./matrix | ./translate | ./rotate | ./scale | ./skew').forEach(function (node) {
			switch (node) {
			case 'lookat':
				// TODO
				break;
			case 'matrix':
				// TODO
				break;
			case 'translate':
				// TODO
				break;
			case 'rotate':
				// TODO
				break;
			case 'scale':
				// TODO
				break;
			case 'skew':
				// TODO
				break;
			}
		});
		return matrix;
	}

	function Node(node) {
		var mesh = meshes[document.queryString(node, 'substring(./instance_geometry/@url, 2)')];
		var matrix = readMatrix(node);
		this.draw = function (program, baseMatrix) {
			mesh.draw(program, baseMatrix.by(matrix));
		};
	}

	function Joint(node) {
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

	this.draw = function (program) {
		roots.forEach(function (node) {
			node.draw(program, OOGL.Matrix4.IDENTITY);
		});
	};
}
