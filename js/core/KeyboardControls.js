const KeyboardState = {
	KeyA: false,
	KeyD: false,
	KeyL: false,
	KeyP: false,
  KeyS: false,
	KeyW: false,
	ArrowLeft: false,
	ArrowUp: false,
  ArrowRight: false,
	ArrowDown: false
}

const onKeyDown = (event) => {
	event.preventDefault();
	KeyboardState[event.code] = true;
}

const onKeyUp = (event) => {
	event.preventDefault();
	KeyboardState[event.code] = false;
	keyLPressedOnce = false;
}

const keyPressed = (keyName) => {
	return KeyboardState[keyName];
}

export { onKeyDown, onKeyUp, keyPressed };
