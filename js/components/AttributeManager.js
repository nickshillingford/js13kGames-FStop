const buffers = new WeakMap();

class AttributeManager {
	constructor(gl) {
		this.gl = gl;
	}

	createBuffer(attribute, bufferType) {
		const array = attribute.array;
		const usage = attribute.usage;
		const size = array.byteLength;
		const buffer = this.gl.createBuffer();

		this.gl.bindBuffer(bufferType, buffer);
		this.gl.bufferData(bufferType, array, usage);

		return {
			buffer: buffer,
			type: (array instanceof Float32Array) ? this.gl.FLOAT : this.gl.UNSIGNED_SHORT,
			bytesPerElement: array.BYTES_PER_ELEMENT,
			version: attribute.version,
			size: size
		};
	}

	get(attribute) {
		return buffers.get(attribute);
	}

	update(attribute, bufferType) {
		const data = buffers.get(attribute);
		if (data === undefined) {
			buffers.set(attribute, this.createBuffer(attribute, bufferType));
		}
	}
}

export { AttributeManager };
