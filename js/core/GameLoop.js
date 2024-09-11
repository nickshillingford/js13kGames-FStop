import { updateInput } from './UpdateInput.js';
import { updateUniforms } from './UpdateUniforms.js';

const gameLoop = () => {
	cameraIsMoving = false;

	if (windowIsBeingResized) {
		cameraIsMoving = true;
		windowIsBeingResized = false;
	}

	if (oldYaw != yaw.rotation.y || oldPitch != pitch.rotation.x) {
		cameraIsMoving = true;
	}

	oldYaw = yaw.rotation.y;
	oldPitch = pitch.rotation.x;

	controls.getDirection(cameraDirectionVector);
	cameraDirectionVector.normalize();
	controls.getUpVector(cameraUpVector);
	cameraUpVector.normalize();
	controls.getRightVector(cameraRightVector);
	cameraRightVector.normalize();

	updateInput();

	updateUniforms();

	if (aperture == 0.0) {
		cameraInfoElement.innerHTML = "Depth of Field: OFF";
	}
	else {
		cameraInfoElement.innerHTML = "Aperture: " + aperture.toFixed(3) + "<br><br> Focus: " + focus;
	}

	renderer.setRenderTarget(rayTracingRenderTarget);
	renderer.render(rayTracingShader, worldCamera);

	renderer.setRenderTarget(copyRenderTarget);
	renderer.render(copyShader, quadCamera);

	renderer.setRenderTarget(null);
	renderer.render(postProcessingShader, quadCamera);

	requestAnimationFrame(gameLoop);
}

export { gameLoop };
