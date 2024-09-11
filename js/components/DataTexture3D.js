import { Texture } from './Texture.js';

class Data3DTexture extends Texture {
	constructor(data, width, height, depth) {
		super(null);
		this.image = { data, width, height, depth };
		this.magFilter = 1003;
		this.minFilter = 1003;
		this.wrapR = 1001;
		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;
	}
}

export { Data3DTexture };
