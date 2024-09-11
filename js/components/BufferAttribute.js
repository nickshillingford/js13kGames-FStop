class BufferAttribute {
	constructor(array, size) {
		this.array = array;
		this.itemSize = size;
		this.usage = 35044;
	}
}

class Float32BufferAttribute extends BufferAttribute {
	constructor(array, size) {
		super(new Float32Array(array), size);
	}
}

class Uint16BufferAttribute extends BufferAttribute {
	constructor(array, size) {
		super(new Uint16Array(array), size);
	}
}

export { BufferAttribute, Uint16BufferAttribute, Float32BufferAttribute };
