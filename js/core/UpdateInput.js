import { keyPressed } from './KeyboardControls.js';

const moveCamera = (c, d) => {
  d > 0 ? cameraControls.position.add(c.multiplyScalar(5 * 0.0164)) : cameraControls.position.sub(c.multiplyScalar(5 * 0.0164));
  cameraIsMoving = true;
  cameraControls.position.x = Math.max(0.5, Math.min(24.5, cameraControls.position.x));
  cameraControls.position.y = camHeight;
  cameraControls.position.z = Math.max(0.5, Math.min(24.5, cameraControls.position.z));
  if (!disableSwitching) {
    if (cameraControls.position.x > 0 && cameraControls.position.x < 2 && cameraControls.position.z > 0 && cameraControls.position.z < 2) {
      needsColorSwitch = true;
      disableSwitching = true;
    }
  }
}

const updateInput = () => {
  if (!isPaused) {
    if ((keyPressed('KeyW')) && !(keyPressed('KeyS'))) {
        moveCamera(cameraDirectionVector, +1);
    }
    if ((keyPressed('KeyS')) && !(keyPressed('KeyW'))) {
        moveCamera(cameraDirectionVector, -1);
    }
    if ((keyPressed('KeyA')) && !(keyPressed('KeyD'))) {
        moveCamera(cameraRightVector, -1);
    }
    if ((keyPressed('KeyD')) && !(keyPressed('KeyA'))) {
        moveCamera(cameraRightVector, +1);
    }
    if (keyPressed('KeyL') && !keyLPressedOnce) {
      camHeight++;
      camHeight = camHeight > 3.0 ? 1.0 : camHeight;
      keyLPressedOnce = true;
    }
    if (keyPressed('ArrowRight')) {
      cameraIsMoving = true;
      aperture = aperture + 0.001;
      if (aperture > 0.1) {aperture = 0.0;}
    }
    if (keyPressed('ArrowLeft')) {
      cameraIsMoving = true;
      aperture = aperture - 0.001;
      if (aperture < 0.0) {aperture = 0.0;}
    }
    if (keyPressed('ArrowUp')) {
      cameraIsMoving = true;
      focus = focus + 0.5;
      if (focus > 24.0) {focus = 1.0;}
    }
    if (keyPressed('ArrowDown')) {
      cameraIsMoving = true;
      focus = focus - 0.5;
      if (focus < 1.0) {focus = 1.0;}
    }
  }
}

export { updateInput };
