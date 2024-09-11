const updateUniforms = () => {
  if (!cameraIsMoving) {
		sampleCounter += 1.0;
		frameCounter += 1.0;
		cameraRecentlyMoving = false;
	}

	if (cameraIsMoving) {
		frameCounter += 1.0;

		if (!cameraRecentlyMoving) {
			rayTracingUniforms.uPreviousSampleCount.value = sampleCounter;
			frameCounter = 1.0;
			cameraRecentlyMoving = true;
		}

		sampleCounter = 1.0;
	}

	rayTracingUniforms.uCameraIsMoving.value = cameraIsMoving;
	rayTracingUniforms.uSampleCounter.value = sampleCounter;
	rayTracingUniforms.uFrameCounter.value = frameCounter;
	rayTracingUniforms.uApertureSize.value = aperture;
	rayTracingUniforms.uFocusDistance.value = focus;

	cameraControls.updateMatrixWorld();
	worldCamera.updateMatrixWorld();
	rayTracingUniforms.uCameraMatrix.value.copy(worldCamera.matrixWorld);

	postProcessingUniforms.uSampleCounter.value = sampleCounter;
	postProcessingUniforms.uOneOverSampleCounter.value = (1.0 / sampleCounter);
}

export { updateUniforms };
