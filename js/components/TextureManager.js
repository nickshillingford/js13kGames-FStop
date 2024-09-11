function TextureManager(_gl, properties) {
	let textureUnits = 0;
	let currentTextureSlot = null;
	let currentBoundTextures = {};

	function texImage2D() {
			_gl.texImage2D.apply(_gl, arguments);
	}

	function bindTexture(webglType, webglTexture, webglSlot) {
		if (webglSlot === undefined) {
			if (currentTextureSlot === null) {
				webglSlot = _gl.TEXTURE0 + 31;
			}
			else {
				webglSlot = currentTextureSlot;
			}
		}
		let boundTexture = currentBoundTextures[webglSlot];
		if (boundTexture === undefined) {
			boundTexture = { type: undefined, texture: undefined };
			currentBoundTextures[ webglSlot ] = boundTexture;
		}
		if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {
			if ( currentTextureSlot !== webglSlot ) {
				_gl.activeTexture( webglSlot );
				currentTextureSlot = webglSlot;
			}
			_gl.bindTexture( webglType, webglTexture );
			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;
		}
	}

	function resetTextureUnits() {
		textureUnits = 0;
	}

	function allocateTextureUnit() {
		const textureUnit = textureUnits;
		textureUnits += 1;
		return textureUnit;
	}

	function texSubImage3D() {
			_gl.texSubImage3D.apply( _gl, arguments );
	}

	function texStorage3D() {
			_gl.texStorage3D.apply( _gl, arguments );
	}

	function activeTexture( webglSlot ) {
		if ( webglSlot === undefined ) webglSlot = _gl.TEXTURE0 + 31;
		if ( currentTextureSlot !== webglSlot ) {
			_gl.activeTexture( webglSlot );
			currentTextureSlot = webglSlot;
		}
	}

	function setTexture2D( texture, slot ) {
		bindTexture( _gl.TEXTURE_2D, properties.get(texture).__webglTexture, _gl.TEXTURE0 + slot );
	}

	function setTexture3D( texture, slot ) {
		const textureProperties = properties.get( texture );
		if (texture.version > 0 && textureProperties.__version !== texture.version) {
			uploadTexture( textureProperties, texture, slot );
			return;
		}
	}

	function uploadTexture(textureProperties, texture, slot) {
    let tt = _gl.TEXTURE_3D;

		textureProperties.__webglTexture = _gl.createTexture();
		bindTexture(tt, textureProperties.__webglTexture, _gl.TEXTURE0 + slot);
		activeTexture(_gl.TEXTURE0 + slot);

			let image = texture.image;

			const glFormat = 6408;
			const glType = 5126;
			const glInternalFormat = 34836;

			_gl.texParameteri( tt, _gl.TEXTURE_WRAP_S, 33071 );
			_gl.texParameteri( tt, _gl.TEXTURE_WRAP_T, 33071 );
			_gl.texParameteri( tt, _gl.TEXTURE_MAG_FILTER, 9728 );
			_gl.texParameteri( tt, _gl.TEXTURE_MIN_FILTER, 9728 );

			texStorage3D( _gl.TEXTURE_3D, 1, glInternalFormat, image.width, image.height, image.depth );
			texSubImage3D( _gl.TEXTURE_3D, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data );

			textureProperties.__version = texture.version;
	}

	function setupRenderTarget( renderTarget ) {
		const texture = renderTarget.texture;
		const renderTargetProperties = properties.get( renderTarget );
		const textureProperties = properties.get( texture );

			if ( textureProperties.__webglTexture === undefined ) {
				textureProperties.__webglTexture = _gl.createTexture();
			}

			textureProperties.__version = texture.version;
			renderTargetProperties.__webglFramebuffer = _gl.createFramebuffer();

			let glTextureType = _gl.TEXTURE_2D;

			bindTexture( glTextureType, textureProperties.__webglTexture );

      _gl.texParameteri( glTextureType, _gl.TEXTURE_WRAP_S, 33071 );
  		_gl.texParameteri( glTextureType, _gl.TEXTURE_WRAP_T, 33071 );
  		_gl.texParameteri( glTextureType, _gl.TEXTURE_MAG_FILTER, 9728 );
  		_gl.texParameteri( glTextureType, _gl.TEXTURE_MIN_FILTER, 9728 );

    	texImage2D( _gl.TEXTURE_2D, 0, 34836, renderTarget.width, renderTarget.height, 0, 6408, 5126, null );

			_gl.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
    	_gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, glTextureType, properties.get( texture ).__webglTexture, 0);
			_gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
			_gl.bindTexture(currentBoundTextures[currentTextureSlot].type, null);
	}

	this.allocateTextureUnit = allocateTextureUnit;
	this.resetTextureUnits = resetTextureUnits;
	this.setTexture2D = setTexture2D;
	this.setTexture3D = setTexture3D;
	this.setupRenderTarget = setupRenderTarget;
}

export { TextureManager };
