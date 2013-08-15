uniform float ScreenRatio;
uniform float Zoom;
uniform vec2 Rotation;
uniform vec2 Translation;
uniform mat4 Matrix;

attribute vec3 in_Vertex;
attribute vec2 in_TexCoord;

varying vec2 ex_TexCoord;

mat4 RotateX(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat4(mat3(
		1, 0, 0,
		0, c, s,
		0, -s, c
	));
}

mat4 RotateY(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat4(mat3(
		c, 0, s,
		0, 1, 0,
		-s, 0, c
	));
}

void main() {
	gl_Position = mat4(
		1.0 / ScreenRatio, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0.05, 0,
		0, 0, 0, 1.0 / Zoom
	) * mat4(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		Translation, 0, 1
	) * RotateX(Rotation.x) * RotateY(Rotation.y) * Matrix * vec4(in_Vertex, 1);
	ex_TexCoord = in_TexCoord;
}
