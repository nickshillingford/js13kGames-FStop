const vert =`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;

#define HIGH_PRECISION

in vec3 position;

void main() {
		gl_Position = vec4( position, 1.0 );
}
`;

export { vert };
