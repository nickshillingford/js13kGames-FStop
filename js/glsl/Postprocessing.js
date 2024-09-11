const frag_output = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;

#define HIGH_PRECISION

out vec4 fragColor;

uniform sampler2D tex;
uniform float uSampleCounter;
uniform float uOneOverSampleCounter;
uniform vec2 uResolution;

vec3 saturate( vec3 a ) {
  return clamp(a, 0.0, 1.0);
}

vec3 ReinhardToneMapping(vec3 color) {
	 color *= 1.0;
	 return saturate(color / (vec3(1.0) + color));
}

void main() {
	vec4 m25[25];
	vec2 xy = gl_FragCoord.xy;
	m25[0] = texelFetch(tex, ivec2(xy + vec2(-2, 2)), 0);
	m25[1] = texelFetch(tex, ivec2(xy + vec2(-1, 2)), 0);
	m25[2] = texelFetch(tex, ivec2(xy + vec2( 0, 2)), 0);
	m25[3] = texelFetch(tex, ivec2(xy + vec2( 1, 2)), 0);
	m25[4] = texelFetch(tex, ivec2(xy + vec2( 2, 2)), 0);
	m25[5] = texelFetch(tex, ivec2(xy + vec2(-2, 1)), 0);
	m25[6] = texelFetch(tex, ivec2(xy + vec2(-1, 1)), 0);
	m25[7] = texelFetch(tex, ivec2(xy + vec2( 0, 1)), 0);
	m25[8] = texelFetch(tex, ivec2(xy + vec2( 1, 1)), 0);
	m25[9] = texelFetch(tex, ivec2(xy + vec2( 2, 1)), 0);
	m25[10] = texelFetch(tex, ivec2(xy + vec2(-2, 0)), 0);
	m25[11] = texelFetch(tex, ivec2(xy + vec2(-1, 0)), 0);
	m25[12] = texelFetch(tex, ivec2(xy + vec2( 0, 0)), 0);
	m25[13] = texelFetch(tex, ivec2(xy + vec2( 1, 0)), 0);
	m25[14] = texelFetch(tex, ivec2(xy + vec2( 2, 0)), 0);
	m25[15] = texelFetch(tex, ivec2(xy + vec2(-2,-1)), 0);
	m25[16] = texelFetch(tex, ivec2(xy + vec2(-1,-1)), 0);
	m25[17] = texelFetch(tex, ivec2(xy + vec2( 0,-1)), 0);
	m25[18] = texelFetch(tex, ivec2(xy + vec2( 1,-1)), 0);
	m25[19] = texelFetch(tex, ivec2(xy + vec2( 2,-1)), 0);
	m25[20] = texelFetch(tex, ivec2(xy + vec2(-2,-2)), 0);
	m25[21] = texelFetch(tex, ivec2(xy + vec2(-1,-2)), 0);
	m25[22] = texelFetch(tex, ivec2(xy + vec2( 0,-2)), 0);
	m25[23] = texelFetch(tex, ivec2(xy + vec2( 1,-2)), 0);
	m25[24] = texelFetch(tex, ivec2(xy + vec2( 2,-2)), 0);

	vec4 centerPixel = m25[12];
	vec3 fpc;
	vec3 edgePixelColor;
	float threshold = 1.0;
	int count = 1;

	fpc = m25[12].rgb;

	// search left
	if (m25[11].a < threshold)
	{
		fpc += m25[11].rgb;
		count++;
		if (m25[10].a < threshold)
		{
			fpc += m25[10].rgb;
			count++;
		}
		if (m25[5].a < threshold)
		{
			fpc += m25[5].rgb;
			count++;
		}
	}
	// search right
	if (m25[13].a < threshold)
	{
		fpc += m25[13].rgb;
		count++;
		if (m25[14].a < threshold)
		{
			fpc += m25[14].rgb;
			count++;
		}
		if (m25[19].a < threshold)
		{
			fpc += m25[19].rgb;
			count++;
		}
	}
	// search above
	if (m25[7].a < threshold)
	{
		fpc += m25[7].rgb;
		count++;
		if (m25[2].a < threshold)
		{
			fpc += m25[2].rgb;
			count++;
		}
		if (m25[3].a < threshold)
		{
			fpc += m25[3].rgb;
			count++;
		}
	}
	// search below
	if (m25[17].a < threshold)
	{
		fpc += m25[17].rgb;
		count++;
		if (m25[22].a < threshold)
		{
			fpc += m25[22].rgb;
			count++;
		}
		if (m25[21].a < threshold)
		{
			fpc += m25[21].rgb;
			count++;
		}
	}
	// search upper-left
	if (m25[6].a < threshold)
	{
		fpc += m25[6].rgb;
		count++;
		if (m25[0].a < threshold)
		{
			fpc += m25[0].rgb;
			count++;
		}
		if (m25[1].a < threshold)
		{
			fpc += m25[1].rgb;
			count++;
		}
	}
	// search upper-right
	if (m25[8].a < threshold)
	{
		fpc += m25[8].rgb;
		count++;
		if (m25[4].a < threshold)
		{
			fpc += m25[4].rgb;
			count++;
		}
		if (m25[9].a < threshold)
		{
			fpc += m25[9].rgb;
			count++;
		}
	}
	// search lower-left
	if (m25[16].a < threshold)
	{
		fpc += m25[16].rgb;
		count++;
		if (m25[15].a < threshold)
		{
			fpc += m25[15].rgb;
			count++;
		}
		if (m25[20].a < threshold)
		{
			fpc += m25[20].rgb;
			count++;
		}
	}
	// search lower-right
	if (m25[18].a < threshold)
	{
		fpc += m25[18].rgb;
		count++;
		if (m25[23].a < threshold)
		{
			fpc += m25[23].rgb;
			count++;
		}
		if (m25[24].a < threshold)
		{
			fpc += m25[24].rgb;
			count++;
		}
	}

	fpc *= (1.0 / float(count));

	vec4 m9[9];
	m9[0] = m25[6];
	m9[1] = m25[7];
	m9[2] = m25[8];
	m9[3] = m25[11];
	m9[4] = m25[12];
	m9[5] = m25[13];
	m9[6] = m25[16];
	m9[7] = m25[17];
	m9[8] = m25[18];

	if (centerPixel.a > 1.0)
	{
		// reset variables
		centerPixel = m9[4];
		count = 1;

		// start with center pixel
		edgePixelColor = m9[4].rgb;

		// search left
		if (m9[3].a > 1.0)
		{
			edgePixelColor += m9[3].rgb;
			count++;
		}
		// search right
		if (m9[5].a > 1.0)
		{
			edgePixelColor += m9[5].rgb;
			count++;
		}
		// search above
		if (m9[1].a > 1.0)
		{
			edgePixelColor += m9[1].rgb;
			count++;
		}
		// search below
		if (m9[7].a > 1.0)
		{
			edgePixelColor += m9[7].rgb;
			count++;
		}
		// search upper-left
		if (m9[0].a > 1.0)
		{
			edgePixelColor += m9[0].rgb;
			count++;
		}
		// search upper-right
		if (m9[2].a > 1.0)
		{
			edgePixelColor += m9[2].rgb;
			count++;
		}
		// search lower-left
		if (m9[6].a > 1.0)
		{
			edgePixelColor += m9[6].rgb;
			count++;
		}
		// search lower-right
		if (m9[8].a > 1.0)
		{
			edgePixelColor += m9[8].rgb;
			count++;
		}

		edgePixelColor /= float(count);
	}

		if (uSampleCounter > 1.0) {
    			if (centerPixel.a > 1.0) {
    					fpc = mix(edgePixelColor, centerPixel.rgb, clamp(uSampleCounter * 0.05, 0.0, 1.0));
    			}
		}
		else if (centerPixel.a > 1.0) {
			   fpc = mix(fpc, centerPixel.rgb, 0.5);
		}

	fpc *= uOneOverSampleCounter;
	fpc = ReinhardToneMapping(fpc);
  fpc.r = pow(fpc.r, 0.9);
  fpc.g = pow(fpc.g, 0.95);
  fpc.b = pow(fpc.b, 1.1);

  fragColor = vec4(sqrt(fpc), 1.0);
}
`;

export { frag_output };
