const frag_input = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;

out vec4 fragColor;

uniform sampler2D tPreviousTexture;
uniform sampler3D uVoxelTexture;
uniform mat4 uCameraMatrix;
uniform vec2 uResolution;
uniform float uSampleCounter;
uniform float uFrameCounter;
uniform float uApertureSize;
uniform float uFocusDistance;
uniform float uPreviousSampleCount;
uniform bool uCameraIsMoving;

#define uSunDirection vec3(0.42850027330247764, 0.2862474085446186, -0.8570005466049553)
#define HIGH_PRECISION
#define LEN 0.5773502691896257
#define PI 3.14159265358979323
#define TWO_PI 6.28318530717958648
#define E 2.71828182845904524
#define INFINITY 1000000.0
#define TRUE 1
#define FALSE 0
#define ONE_OVER_MAX_INT 1.0 / float(0xffffffffU)
#define THREE_OVER_SIXTEENPI 0.05968310365946075
#define ONE_OVER_FOURPI 0.07957747154594767
#define TOTAL_RAYLEIGH vec3(5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5)
#define K vec3(0.686, 0.678, 0.666)
#define MIE_CONST vec3(1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14)
#define UP_VECTOR vec3(0.0, 1.0, 0.0)
#define SUN_ANGULAR_DIAMETER_COS 0.9998
#define CUTOFF_ANGLE 1.6110731556870734
#define gridBoundsMin vec3(0.0, 0.0, 0.0)
#define gridBoundsMax vec3(25.0, 0.3, 25.0)
#define gridSizeX 250.0
#define gridSizeY 3.0
#define gridSizeZ 250.0
#define cellSize 0.1

vec3 rayOrigin, rayDirection;
vec3 hitNormal, hitColor;
float blueNoise;
float randNumber;
uvec2 seed;

float rand() {
	randNumber += (blueNoise + (mod(uFrameCounter, 32.0) * 0.61803399));
	return fract(randNumber);
}
float rng() {
	seed += uvec2(1);
  uvec2 q = 1103515245U * ( (seed >> 1U) ^ (seed.yx) );
  uint  n = 1103515245U * ( (q.x) ^ (q.y >> 3U) );
	return float(n) * ONE_OVER_MAX_INT;
}
vec3 randomCosWeightedDirectionInHemisphere(vec3 nl) {
	float z = (rng() * 2.0) - 1.0;
	float phi = rng() * TWO_PI;
	float r = sqrt(1.0 - (z * z));
  return normalize(nl + vec3(r * cos(phi), r * sin(phi), z));
}
vec3 randomDirectionInSpecularLobe(vec3 reflectionDir, float roughness) {
	float z = (rng() * 2.0) - 1.0;
	float phi = rng() * TWO_PI;
	float r = sqrt(1.0 - (z * z));
  vec3 cosDiffuseDir = normalize(reflectionDir + vec3(r * cos(phi), r * sin(phi), z));
	return normalize( mix(reflectionDir, cosDiffuseDir, roughness * roughness) );
}
float RayleighPhase(float cosTheta) {
	return THREE_OVER_SIXTEENPI * (1.0 + (cosTheta * cosTheta));
}
float hgPhase(float cosTheta, float g) {
  float g2 = g * g;
  float inv = 1.0 / pow(max(0.0, 1.0 - (2.0 * g * cosTheta) + g2), 1.5);
	return ONE_OVER_FOURPI * ((1.0 - g2) * inv);
}
vec3 totalMie() {
	float c = (0.2 * 1.0) * 10E-18;
	return 0.434 * c * MIE_CONST;
}
float SunIntensity(float zenithAngleCos) {
	zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);
	return 1000.0 * max(0.0, 1.0 - pow(E, -((CUTOFF_ANGLE - acos(zenithAngleCos)) / 1.5)));
}
vec3 getSkyColor(vec3 rayDir) {
	vec3 viewDirection = normalize(rayDir);
	vec3 rayleighAtX = TOTAL_RAYLEIGH * 3.0;
	vec3 mieAtX = totalMie() * 0.03;
	float cosViewSunAngle = dot(viewDirection, uSunDirection);
  float cosSunUpAngle = dot(UP_VECTOR, uSunDirection);
	float cosUpViewAngle = dot(UP_VECTOR, viewDirection);
  float sunE = SunIntensity(cosSunUpAngle);
	float zenithAngle = acos( max( 0.0, dot( UP_VECTOR, viewDirection ) ) );
	float inv = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / PI ), -1.253 ) );
	float rayleighOpticalLength = 8400.0 * inv;
	float mieOpticalLength = 1250.0 * inv;
	vec3 Fex = exp(-((rayleighAtX * rayleighOpticalLength) + (mieAtX * mieOpticalLength)));
	vec3 betaRTheta = rayleighAtX * RayleighPhase((cosViewSunAngle * 0.5) + 0.5);
	vec3 betaMTheta = mieAtX * hgPhase(cosViewSunAngle, 0.76);
	vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (rayleighAtX + mieAtX)) * (1.0 - Fex), vec3(1.5));
	Lin *= mix(vec3(1.0), pow(sunE * ((betaRTheta + betaMTheta) / (rayleighAtX + mieAtX)) * Fex, vec3(0.5)), clamp(pow(1.0 - cosSunUpAngle, 5.0), 0.0, 1.0));
	vec3 L0 = vec3(0.1) * Fex;
	float sundisk = smoothstep(SUN_ANGULAR_DIAMETER_COS, SUN_ANGULAR_DIAMETER_COS + 0.00002, cosViewSunAngle);
	L0 += (sunE * 19000.0 * Fex) * sundisk;
	vec3 texColor = ((Lin + L0) * 0.04) + vec3(0.0, 0.0003, 0.00075);
	float sunfade = 1.0 - clamp(1.0 - exp((uSunDirection.y / 450000.0)), 0.0, 1.0);
	vec3 retColor = pow(texColor, vec3(1.0 / (1.2 + (1.2 * sunfade))));
	return retColor;
}
float BoxIntersect(vec3 minCorner, vec3 maxCorner, vec3 rayOrigin, vec3 rayDirection, out vec3 normal, out int isRayExiting) {
	vec3 invDir = 1.0 / rayDirection;
	vec3 near = (minCorner - rayOrigin) * invDir;
	vec3 far  = (maxCorner - rayOrigin) * invDir;
	vec3 tmin = min(near, far);
	vec3 tmax = max(near, far);
	float t0 = max( max(tmin.x, tmin.y), tmin.z);
	float t1 = min( min(tmax.x, tmax.y), tmax.z);
	if (t0 > t1) return INFINITY;
	if (t0 > 0.0) {
		normal = -sign(rayDirection) * step(tmin.yzx, tmin) * step(tmin.zxy, tmin);
		isRayExiting = FALSE;
		return t0;
	}
	if (t1 > 0.0) {
		normal = -sign(rayDirection) * step(tmax, tmax.yzx) * step(tmax, tmax.zxy);
		isRayExiting = TRUE;
		return t1;
	}
	return INFINITY;
}
float tentFilter(float x) {
	return (x < 0.5) ? sqrt(2.0 * x) - 1.0 : 1.0 - sqrt(2.0 - (2.0 * x));
}
float hashF(vec2 p) {
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}
float blueNoiseF(vec2 uv, float scale) {
    vec2 i = floor(uv * scale);
    vec2 f = fract(uv * scale);
    float a = hashF(i + vec2(0.0, 0.0));
    float b = hashF(i + vec2(1.0, 0.0));
    float c = hashF(i + vec2(0.0, 1.0));
    float d = hashF(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float traverseGrid(vec3 cc) {
		vec3 normal;
		float d;
		float t = INFINITY;
		int isRayExiting = FALSE;
		float stepX = rayDirection.x > 0.0 ? 1.0 : -1.0;
		float stepY = rayDirection.y > 0.0 ? 1.0 : -1.0;
		float stepZ = rayDirection.z > 0.0 ? 1.0 : -1.0;
		float tMaxX = ((stepX > 0.0 ? cc.x + 1.0 : cc.x) * cellSize + gridBoundsMin.x - rayOrigin.x) / rayDirection.x;
		float tMaxY = ((stepY > 0.0 ? cc.y + 1.0 : cc.y) * cellSize + gridBoundsMin.y - rayOrigin.y) / rayDirection.y;
		float tMaxZ = ((stepZ > 0.0 ? cc.z + 1.0 : cc.z) * cellSize + gridBoundsMin.z - rayOrigin.z) / rayDirection.z;
		float deltaX = abs(cellSize / rayDirection.x);
		float deltaY = abs(cellSize / rayDirection.y);
		float deltaZ = abs(cellSize / rayDirection.z);
		while (cc.x >= 0.0 && cc.x < gridSizeX && cc.y >= 0.0 && cc.y < gridSizeY && cc.z >= 0.0 && cc.z < gridSizeZ) {
					 ivec3 voxelCoord = ivec3(cc.x, cc.y, cc.z);
					 vec4 occupancy = texelFetch(uVoxelTexture, voxelCoord, 0);
					 if (occupancy.a > 0.0) {
							vec3 minBoxBorder = vec3(
								gridBoundsMin.x + float(voxelCoord.x) * cellSize,
								gridBoundsMin.y + float(voxelCoord.y) * cellSize,
								gridBoundsMin.z + float(voxelCoord.z) * cellSize
							);
							vec3 maxBoxBorder = vec3(
								minBoxBorder.x + cellSize,
								minBoxBorder.y + cellSize,
								minBoxBorder.z + cellSize
							);
							d = BoxIntersect(minBoxBorder, maxBoxBorder, rayOrigin, rayDirection, normal, isRayExiting);
							if (d < t) {
									 t = d;
									 hitNormal = normal;
									 hitColor = occupancy.rgb;
							}
					 }
					 if (t < INFINITY) { return t; }
					 if (tMaxX < tMaxY) {
								if (tMaxX < tMaxZ) {
										cc.x += stepX;
										tMaxX += deltaX;
								} else {
										cc.z += stepZ;
										tMaxZ += deltaZ;
								}
						}
						else {
								if (tMaxY < tMaxZ) {
										cc.y += stepY;
										tMaxY += deltaY;
								} else {
										cc.z += stepZ;
										tMaxZ += deltaZ;
								}
						}
		}
		float tExit = min(min(tMaxX, tMaxY), tMaxZ);
		float ey = (rayOrigin.y + rayDirection.y * tExit);
		ey = min(max(ey, gridBoundsMin.y), gridBoundsMax.y);
		float rv = round(ey * 100.0) / 100.0;
		if (rv == 0.0) {
				d = BoxIntersect(vec3(0.0, -0.2, 0.0), vec3(25.0, 0.0, 25.0), rayOrigin, rayDirection, normal, isRayExiting);
				if (d < t) {
						t = d;
						hitNormal = normal;
						hitColor = vec3(0.95, 0.94, 0.85);
				}
				return t;
		}
		else {
				return INFINITY;
		}
}
vec3 Raytrace(out vec3 objectNormal, out vec3 objectColor, out float pixelSharpness) {
	vec3 skyRayOrigin, skyRayDirection;
	vec3 cameraRayOrigin, cameraRayDirection;
	cameraRayOrigin = rayOrigin;
	cameraRayDirection = rayDirection;
	vec3 randVec = vec3(rng() * 2.0 - 1.0, rng() * 2.0 - 1.0, rng() * 2.0 - 1.0);
	randVec = normalize(randVec);
	vec3 initialSkyColor = getSkyColor(rayDirection);
	skyRayOrigin = rayOrigin * vec3(0.02);
	skyRayDirection = normalize(vec3(rayDirection.x, abs(rayDirection.y), rayDirection.z));
	vec3 skyPos = skyRayOrigin + skyRayDirection;
	vec3 accumCol = vec3(0);
  vec3 mask = vec3(1);
	vec3 n, nl, x;
	vec3 firstX = vec3(0);
	float weight;
	float t = INFINITY;
	int diffuseCount = 0;
	int skyHit = FALSE;
	int sampleLight = FALSE;
	int bounceIsSpecular = TRUE;
	int isRayExiting = FALSE;
	vec3 normal;
	float hit;
	float hitDistance;
	hit = BoxIntersect(gridBoundsMin, gridBoundsMax, rayOrigin, rayDirection, normal, isRayExiting);
	if (hit < INFINITY) {
		hitNormal = normal;
		n = normalize(hitNormal);
		nl = dot(n, rayDirection) < 0.0 ? n : -n;
		x = rayOrigin + rayDirection * hit;
		vec3 cc;
		for (int bounces = 0; bounces < 3; bounces++) {
				if (bounces == 0) {
					float epsilon = 0.0001;
					cc = x - epsilon * n;
					cc = vec3(floor((cc.x - gridBoundsMin.x) / cellSize),floor((cc.y - gridBoundsMin.y) / cellSize),floor((cc.z - gridBoundsMin.z) / cellSize));
				}
				else {
					cc = vec3(floor((rayOrigin.x - gridBoundsMin.x) / cellSize),floor((rayOrigin.y - gridBoundsMin.y) / cellSize),floor((rayOrigin.z - gridBoundsMin.z) / cellSize));
				}
				t = traverseGrid(cc);
				if (t == INFINITY) {
					vec3 skyColor = getSkyColor(rayDirection);
					if (bounces == 0) {
						pixelSharpness = 1.01;
						skyHit = TRUE;
						firstX = skyPos;
						initialSkyColor = skyColor;
						accumCol += skyColor;
						break;
					}
					else if (diffuseCount == 0 && bounceIsSpecular == TRUE) {
						pixelSharpness = 1.01;
						firstX = skyPos;
						initialSkyColor = mask * skyColor;
						accumCol += initialSkyColor;
					}
					else if (sampleLight == TRUE) {
						accumCol += mask * skyColor;
					}
					else if (diffuseCount > 0) {
						weight = dot(rayDirection, uSunDirection) < 0.99 ? 1.0 : 0.0;
						accumCol += mask * skyColor * weight;
					}
					break;
				}
				if (sampleLight == TRUE) { break; }
				n = normalize(hitNormal);
				nl = dot(n, rayDirection) < 0.0 ? n : -n;
				x = rayOrigin + rayDirection * t;
				if (bounces == 0) {
					firstX = x;
					objectNormal = nl;
					objectColor = hitColor;
				}
				diffuseCount++;
				mask *= hitColor;
				bounceIsSpecular = FALSE;
				if (diffuseCount == 1 && rand() < 0.5) {
					mask *= 2.0;
					rayDirection = randomCosWeightedDirectionInHemisphere(nl);
					rayOrigin = x + nl * 0.01;
					continue;
				}
				rayDirection = randomDirectionInSpecularLobe(uSunDirection, 0.1);
				rayOrigin = x + nl * 0.01;
				weight = max(0.0, dot(rayDirection, nl)) * 0.05;
				mask *= diffuseCount == 1 ? 2.0 : 1.0;
				mask *= weight;
				sampleLight = TRUE;
		}
	}
	else {
		vec3 skyColor = getSkyColor(rayDirection);
		pixelSharpness = 1.01;
		skyHit = TRUE;
		firstX = skyPos;
		initialSkyColor = skyColor;
		accumCol += skyColor;
	}
	if (skyHit == TRUE) {
			vec3 sunColor = clamp(getSkyColor(randomDirectionInSpecularLobe(uSunDirection, 0.1)), 0.0, 5.0);
			hitDistance = distance(skyRayOrigin, skyPos);
			accumCol = mask * mix(accumCol, initialSkyColor, clamp(exp2(-hitDistance * 0.004), 0.0, 1.0));
	}
	else {
			hitDistance = distance(cameraRayOrigin, firstX);
			accumCol = mix(initialSkyColor, accumCol, clamp(exp2(-log(hitDistance * 0.00003)), 0.0, 1.0));
	}
	return max(vec3(0), accumCol);
}
void main() {
  vec3 camR = vec3(uCameraMatrix[0][0], uCameraMatrix[0][1], uCameraMatrix[0][2]);
  vec3 camU = vec3(uCameraMatrix[1][0], uCameraMatrix[1][1], uCameraMatrix[1][2]);
  vec3 camF = vec3(-uCameraMatrix[2][0], -uCameraMatrix[2][1], -uCameraMatrix[2][2]);
	vec3 camP = vec3(uCameraMatrix[3][0], uCameraMatrix[3][1], uCameraMatrix[3][2]);

	seed = uvec2(uFrameCounter, uFrameCounter + 1.0) * uvec2(gl_FragCoord);
	randNumber = 0.0;
	blueNoise = blueNoiseF(gl_FragCoord.xy / uResolution.xy, 384.0);

	vec3 objectNormal, objectColor;
	float pixelSharpness = 0.0;
	vec4 cp = vec4(0);

	vec2 pixelOffset = vec2( tentFilter(rng()), tentFilter(rng()) );
	vec2 pixelPos = ((gl_FragCoord.xy + pixelOffset) / uResolution) * 2.0 - 1.0;
	vec3 rayDir = normalize( pixelPos.x * camR * LEN + pixelPos.y * camU * LEN + camF );

	vec3 focalPoint = uFocusDistance * rayDir;
	float randomAngle = rng() * TWO_PI;
	float randomRadius = rng() * uApertureSize;
	vec3 randomAperturePos = (cos(randomAngle) * camR + sin(randomAngle) * camU) * sqrt(randomRadius);
	vec3 finalRayDir = normalize(focalPoint - randomAperturePos);

	rayOrigin = camP + randomAperturePos;
	rayDirection = finalRayDir;

	cp += vec4(vec3(Raytrace(objectNormal, objectColor, pixelSharpness)), 0.0);
	seed *= uvec2(3);
	vec4 pp = texelFetch(tPreviousTexture, ivec2(gl_FragCoord.xy), 0);

	if (uFrameCounter == 1.0) {
			pp.rgb *= (1.0 / uPreviousSampleCount) * 0.5;
			cp.rgb *= 0.5;
	}
	else if (uCameraIsMoving) {
			pp.rgb *= 0.5;
			cp.rgb *= 0.5;
	}

	if (cp.rgb == vec3(0.0)) {
			cp.rgb = pp.rgb;
			pp.rgb *= 0.5;
			cp.rgb *= 0.5;
	}

	fragColor = vec4(pp.rgb + cp.rgb, 1.01);
}
`;

export { frag_input };
