import { Float32BufferAttribute, Uint16BufferAttribute } from './BufferAttribute.js';

class PlaneGeometry {
	constructor() {
		this.index = new (Uint16BufferAttribute)([0,2,1,2,3,1], 1);
		this.attributes = {
			'position': new Float32BufferAttribute([-1,1,0,1,1,0,-1,-1,0,1,-1,0], 3)
		};
	}
}

export { PlaneGeometry };
