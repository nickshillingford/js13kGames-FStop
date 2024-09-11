const copy = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;

#define HIGH_PRECISION

out vec4 fragColor;

uniform sampler2D tex;

void main() {
		fragColor = texelFetch(tex, ivec2(gl_FragCoord.xy), 0);
}
`;

export { copy };
