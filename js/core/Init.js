import { Renderer } from '../components/Renderer.js';
import { RenderTarget } from '../components/RenderTarget.js';
import { ScreenQuad } from '../components/ScreenQuad.js';
import { PlaneGeometry } from '../components/PlaneGeometry.js';
import { Object3D } from '../components/Object3D.js';
import { Data3DTexture } from '../components/DataTexture3D.js';
import { Matrix4 } from '../components/Matrix4.js';
import { Vector3 } from '../components/Vector3.js';
import { SeededRandom } from '../components/RNG.js';
import { Controls } from './MouseControls.js';
import { onKeyUp, onKeyDown } from './KeyboardControls.js';
import { gameLoop } from './GameLoop.js';
import { vert } from '../glsl/Vert.js';
import { copy } from '../glsl/Copy.js';
import { frag_input } from '../glsl/Raytracing.js';
import { frag_output } from '../glsl/Postprocessing.js';

cameraDirectionVector = new Vector3();
cameraRightVector = new Vector3();
cameraUpVector = new Vector3();

const textureWidth = 250;
const textureHeight = 3;
const textureDepth = 250;

const loadTexture = () => {
	const arr = new Float32Array(textureWidth * textureHeight * textureDepth * 4);
	const seededRandom = new SeededRandom(SEED);
	const VOXELS = [{ o: 1 }, { o: 0 }, { o: 0 }, { o: 0 }];
	const PINK_VOXEL_COLORS = [
		{ r: 255, g: 105, b: 180 },
		{ r: 255, g: 90, b: 147 },
		{ r: 255, g: 172, b: 190 }
	];
	for (let z = 0; z < textureDepth; z++) {
		 for (let y = 0; y < textureHeight; y++) {
		    for (let x = 0; x < textureWidth; x++) {
		       const vox = VOXELS[Math.floor(seededRandom.random() * 4)];
						if (vox.o !== 0) {
							const col = PINK_VOXEL_COLORS[Math.floor(seededRandom.random() * 3)];
							setVoxel(arr, [x, y, z], [(col.r/255), (col.g/255), (col.b/255)]);
						}
		    }
		 }
	}
	const texture3d = new Data3DTexture(arr, textureWidth, textureHeight, textureDepth);
	texture3d.format = 1023;
	texture3d.type = 1015;
	texture3d.minFilter = 1003;
	texture3d.magFilter = 1003;
	texture3d.unpackAlignment = 1;
	texture3d.needsUpdate = true;
	return texture3d;
}

const setVoxel = (arr, position, color) => {
		const i = (position[2] * textureDepth * textureHeight + position[1] * textureWidth + position[0]);
		const s = (i * 4);
		arr[s] = color[0];
		arr[s + 1] = color[1];
		arr[s + 2] = color[2];
		arr[s + 3] = 1.0;
}

const onWindowResize = (event) => {
	windowIsBeingResized = true;
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	rayTracingUniforms.uResolution.value.x = context.drawingBufferWidth;
	rayTracingUniforms.uResolution.value.y = context.drawingBufferHeight;
	postProcessingUniforms.uResolution.value.x = context.drawingBufferWidth;
	postProcessingUniforms.uResolution.value.y = context.drawingBufferHeight;
	rayTracingRenderTarget.setSize(context.drawingBufferWidth, context.drawingBufferHeight);
	copyRenderTarget.setSize(context.drawingBufferWidth, context.drawingBufferHeight);
}

const init = () => {
		window.addEventListener('resize', onWindowResize, false);

		document.body.addEventListener("click", function (event) {
			if (!ableToEngagePointerLock) {
					return;
			}
			this.requestPointerLock = this.requestPointerLock || this.mozRequestPointerLock;
			this.requestPointerLock();
		}, false);

		pointerlockChange = function (event) {
			if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body) {
				document.addEventListener('keydown', onKeyDown, false);
				document.addEventListener('keyup', onKeyUp, false);
				isPaused = false;
			}
			else {
				document.removeEventListener('keydown', onKeyDown, false);
				document.removeEventListener('keyup', onKeyUp, false);
				isPaused = true;
			}
		};

		document.addEventListener('pointerlockchange', pointerlockChange, false);
		document.addEventListener('mozpointerlockchange', pointerlockChange, false);

		initGameComponents();
}

const initGameComponents = () => {
	renderer = new Renderer({
		canvas: canvas,
		context: canvas.getContext('webgl2')
	});
	context = renderer.getContext();
	context.getExtension('EXT_color_buffer_float');

	cameraInfoElement = document.getElementById('cameraInfo');

	rayTracingShader = new Object3D();
	copyShader = new Object3D();
	postProcessingShader = new Object3D();
	quadCamera = new Object3D();

	copyShader.add(quadCamera);
	postProcessingShader.add(quadCamera);

	worldCamera = new Object3D();
	rayTracingShader.add(worldCamera);
	controls = new Controls(worldCamera);
	cameraControls = controls.getObject();
	yaw = controls.getYawObject();
	pitch = controls.getPitchObject();
	rayTracingShader.add(cameraControls);

	rayTracingRenderTarget = new RenderTarget(context.drawingBufferWidth, context.drawingBufferHeight);
	copyRenderTarget = new RenderTarget(context.drawingBufferWidth, context.drawingBufferHeight);

	cameraControls.position.set(4.0, camHeight, 13.0);
	focus = 1.0;
	aperture = 0.0;

	rayTracingGeometry = new PlaneGeometry();
	rayTracingUniforms = {
		tPreviousTexture: { value: copyRenderTarget.texture },
		uCameraMatrix: { type: "m4", value: new Matrix4() },
		uResolution: { type: "v2", value: { x: 0, y: 0 } },
		uSampleCounter: { type: "f", value: 0.0 },
		uPreviousSampleCount: { type: "f", value: 1.0 },
		uFrameCounter: { type: "f", value: 1.0 },
		uApertureSize: { type: "f", value: aperture },
		uFocusDistance: { type: "f", value: focus },
		uCameraIsMoving: { type: "b1", value: false }
	};

	const t3d = loadTexture();
	rayTracingUniforms.uVoxelTexture = { value: t3d };

	commonVert = vert;
	rayTracingFragmentShader = frag_input;
	rayTracingMaterial = {
			version: 0,
			uniforms: rayTracingUniforms,
			vertexShader: commonVert,
			fragmentShader: rayTracingFragmentShader
	};

	rayTracingQuad = new ScreenQuad(rayTracingGeometry, rayTracingMaterial);
	rayTracingShader.add(rayTracingQuad);
	worldCamera.add(rayTracingQuad);

	copyGeometry = new PlaneGeometry();
	copyUniforms = { tex: { value: rayTracingRenderTarget.texture } };

	setTimeout(function() {
			copyFragmentShader = copy;
			copyMaterial = {
				version: 0,
				uniforms: copyUniforms,
				vertexShader: commonVert,
				fragmentShader: copyFragmentShader
			};
			copyQuad = new ScreenQuad(copyGeometry, copyMaterial);
			copyShader.add(copyQuad);
	}, 1000);

	postProcessingGeometry = new PlaneGeometry();
	postProcessingUniforms = {
		tex: { value: rayTracingRenderTarget.texture },
		uSampleCounter: { type: "f", value: 0.0 },
		uOneOverSampleCounter: { type: "f", value: 0.0 },
		uResolution: { type: "v2", value: { x: 0, y: 0 } }
	};

	setTimeout(function() {
		postProcessingFragmentShader = frag_output;
		postProcessingMaterial = {
			version: 0,
			uniforms: postProcessingUniforms,
			vertexShader: commonVert,
			fragmentShader: postProcessingFragmentShader
		};
		postProcessingQuad = new ScreenQuad(postProcessingGeometry, postProcessingMaterial);
		postProcessingShader.add(postProcessingQuad);
	}, 1000);

	onWindowResize();
	gameLoop();
}

export { init };
