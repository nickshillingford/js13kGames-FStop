const mat4array = new Float32Array(16);
const RePathPart = /(\w+)(\])?(\[|\.)?/g;

function setValueV1f(gl, v) {
	const cache = this.cache;
	if (cache[0] === v) return;
	gl.uniform1f(this.addr, v);
	cache[0] = v;
}

function setValueV2f(gl, v) {
	const cache = this.cache;
	if (cache[0] !== v.x || cache[1] !== v.y) {
			gl.uniform2f(this.addr, v.x, v.y);
			cache[0] = v.x;
			cache[1] = v.y;
	}
}

function setValueV3f(gl, v) {
	const cache = this.cache;
	if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) {
			gl.uniform3f(this.addr, v.x, v.y, v.z);
			cache[0] = v.x;
			cache[1] = v.y;
			cache[2] = v.z;
	}
}

function setValueM4(gl, v) {
	const cache = this.cache;
	const elements = v.elements;
	mat4array.set(elements);
	gl.uniformMatrix4fv(this.addr, false, mat4array);
}

function setValueV1i(gl, v) {
	const cache = this.cache;
	if (cache[0] === v) return;
	gl.uniform1i(this.addr, v);
	cache[0] = v;
}

function setValueT1(gl, v, textures) {
	const cache = this.cache;
	const unit = textures.allocateTextureUnit();
	if (cache[0] !== unit) {
		gl.uniform1i(this.addr, unit);
		cache[0] = unit;
	}
	textures.setTexture2D(v, unit);
}

function setValueT3D1(gl, v, textures) {
	const cache = this.cache;
	const unit = textures.allocateTextureUnit();
	if (cache[0] !== unit) {
		gl.uniform1i(this.addr, unit);
		cache[0] = unit;
	}
	textures.setTexture3D(v, unit);
}

const getSingularSetter = (type) => {
	switch (type) {
		case 0x1406: return setValueV1f;
		case 0x8b50: return setValueV2f;
		case 0x8b51: return setValueV3f;
		case 0x8b5c: return setValueM4;
		case 0x8b56: return setValueV1i;
		case 0x8b5e: return setValueT1;
		case 0x8b5f: return setValueT3D1;
	}
}

const addUniform = (container, uniformObject) => {
	container.seq.push(uniformObject);
	container.map[uniformObject.id] = uniformObject;
}

const parseUniform = (activeInfo, addr, container) => {
	const path = activeInfo.name;
	RePathPart.lastIndex = 0;
	const match = RePathPart.exec(path);
	addUniform(container, new SingleUniform(match[1], activeInfo, addr));
}

class SingleUniform {
	constructor(id, activeInfo, addr) {
		this.id = id;
		this.addr = addr;
		this.cache = [];
		this.type = activeInfo.type;
		this.setValue = getSingularSetter(activeInfo.type);
	}
}

class UniformManager {
	constructor(gl, program) {
		this.seq = [];
		this.map = {};

		const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

		for (let i = 0; i < n; i++) {
			const info = gl.getActiveUniform(program, i);
			const addr = gl.getUniformLocation(program, info.name);
			parseUniform(info, addr, this);
		}
	}

	setValue(gl, name, value, textures) {
		const u = this.map[name];
		if (u !== undefined) u.setValue(gl, value, textures);
	}

	static upload(gl, seq, values, textures) {
		for (let i = 0, n = seq.length; i !== n; i++) {
			const u = seq[i];
			const v = values[u.id];
			if (v.needsUpdate !== false) {
				u.setValue(gl, v.value, textures);
			}
		}
	}

	static seqWithValue(seq, values) {
		const r = [];
		for (let i = 0, n = seq.length; i !== n; i++) {
			const u = seq[i];
			if (u.id in values) r.push(u);
		}
		return r;
	}
}

export { UniformManager };
