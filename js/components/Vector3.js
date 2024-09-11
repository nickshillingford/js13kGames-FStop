class Vector3 {
	constructor( x = 0, y = 0, z = 0 ) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set( x, y, z ) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	clone() {
		return new this.constructor( this.x, this.y, this.z );
	}

	add( v ) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}

	sub( v ) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}

	multiplyScalar( scalar ) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	divideScalar( scalar ) {
		return this.multiplyScalar( 1 / scalar );
	}

	negate() {
		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		return this;
	}

	length() {
		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
	}

	normalize() {
		return this.divideScalar( this.length() || 1 );
	}
}

export { Vector3 };
