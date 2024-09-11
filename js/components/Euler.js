class Euler {
	constructor() {
		this._x = 0;
		this._y = 0;
		this._z = 0;
		this._order = 'XYZ';
	}

	get x() {
		return this._x;
	}

	set x( value ) {
		this._x = value;
		this._onChangeCallback();
	}

	get y() {
		return this._y;
	}

	set y( value ) {
		this._y = value;
		this._onChangeCallback();
	}

	get z() {
		return this._z;
	}

	set z( value ) {
		this._z = value;
		this._onChangeCallback();
	}

	set order( value ) {
		this._order = value;
		this._onChangeCallback();
	}

	set( x, y, z, order = this._order ) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;
		this._onChangeCallback();
		return this;
	}

	_onChange( callback ) {
		this._onChangeCallback = callback;
		return this;
	}

	_onChangeCallback() {}
}

export { Euler };
