precision mediump float;

uniform sampler2D Texture;

varying vec4 ex_Normal;
varying vec2 ex_TexCoord;

void main() {
	vec4 Sample = texture2D(Texture, vec2(ex_TexCoord.x, 1.0 - ex_TexCoord.y));
	gl_FragColor = vec4(vec3(Sample) * (acos(dot(vec3(0, 0, 1), vec3(ex_Normal) / ex_Normal.w)) / (acos(-1.0) * 2.0) + 1.0), Sample.a);
}
