precision mediump float;

uniform sampler2D Texture;

varying vec2 ex_TexCoord;

void main() {
	gl_FragColor = texture2D(Texture, vec2(ex_TexCoord.x, 1.0 - ex_TexCoord.y));
}
