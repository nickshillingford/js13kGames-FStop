let _textureId = 0;

class Texture {
	constructor(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type) {
		this.isTexture = true;
		Object.defineProperty(this, 'id', { value: _textureId++ });
		this.source = { data: image, dataReady: true };
		this.wrapS = wrapS;
		this.wrapT = wrapT;
		this.magFilter = magFilter;
		this.minFilter = minFilter;
		this.format = format;
		this.internalFormat = null;
		this.type = type;
		this.flipY = true;
		this.unpackAlignment = 4;
		this.version = 0;
	}

	get image() {
		return this.source.data;
	}

	set image( value = null ) {
		this.source.data = value;
	}

	set needsUpdate( value ) {
		if ( value === true ) {
			this.version++;
		}
	}
}

Texture.DEFAULT_IMAGE = null;

export { Texture };
