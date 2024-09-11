class Quaternion {
	constructor( x = 0, y = 0, z = 0, w = 1 ) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get z() {
		return this._z;
	}

	get w() {
		return this._w;
	}

	set( x, y, z, w ) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
		return this;
	}

	setFromEuler(euler) {
		const x = euler._x, y = euler._y, z = euler._z, order = euler._order;
		const cos = Math.cos;
		const sin = Math.sin;
		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );
		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );
		this._x = s1 * c2 * c3 + c1 * s2 * s3;
		this._y = c1 * s2 * c3 - s1 * c2 * s3;
		this._z = c1 * c2 * s3 + s1 * s2 * c3;
		this._w = c1 * c2 * c3 - s1 * s2 * s3;
		return this;
	}
}

export { Quaternion };
