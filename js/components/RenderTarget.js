import { Texture } from './Texture.js';

class RenderTarget {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.viewport = { x: 0, y: 0, z: width, w: height };
		this.textures = [new Texture({ width: width, height: height }, null, null, null, 1003, 1003, 1023, 1015)];
	}

	get texture() {
		return this.textures[0];
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.viewport = { x: 0, y: 0, z: width, w: height };
	}
}

export { RenderTarget };
