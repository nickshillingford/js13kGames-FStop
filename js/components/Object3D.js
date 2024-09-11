import { Euler } from './Euler.js';
import { Matrix4 } from './Matrix4.js';
import { Vector3 } from './Vector3.js';
import { Quaternion } from './Quaternion.js';

class Object3D {
	constructor() {
		this.parent = null;
		this.children = [];

		const position = new Vector3();
		const rotation = new Euler();
		const quaternion = new Quaternion();
		const scale = new Vector3(1, 1, 1);

		function onRotationChange() {
			quaternion.setFromEuler(rotation);
		}

		rotation._onChange(onRotationChange);

		Object.defineProperties(this, {
			position: { value: position },
			rotation: { value: rotation },
			quaternion: { value: quaternion },
			scale: { value: scale }
		});

		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();
	}

	add (object) {
		object.parent = this;
		this.children.push(object);
	}

	updateMatrixWorld() {
		this.matrix.compose(this.position, this.quaternion, this.scale);
		if (this.parent === null) {
			this.matrixWorld.copy(this.matrix);
		}
		else {
			this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
		}
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) {
			children[i].updateMatrixWorld();
		}
	}
}

export { Object3D };
