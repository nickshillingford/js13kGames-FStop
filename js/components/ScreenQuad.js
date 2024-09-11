import { Object3D } from './Object3D.js';

class ScreenQuad extends Object3D {
	constructor(geo, mat) {
		super();
		this.isQuad = true;
		this.geometry = geo;
		this.material = mat;
	}
}

export { ScreenQuad };
