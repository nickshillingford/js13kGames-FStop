import { PropertiesManager } from './PropertiesManager.js';
import { TextureManager } from './TextureManager.js';
import { AttributeManager } from './AttributeManager.js';
import { ProgramManager } from './ProgramManager.js';
import { UniformManager } from './UniformManager.js';

class Renderer {
		constructor(parameters) {
			const { canvas, context } = parameters;

			this.canvas = canvas;
			this.context = context;
			this.currentRenderList = [];
			this.domElement = canvas;
			this.currentProgram = null;
			this._width = canvas.width;
			this._height = canvas.height;
			this._pixelRatio = 1;
			this._gl = context;
			this.properties = new PropertiesManager();
			this.textures = new TextureManager(this._gl, this.properties);
			this.attributes  = new AttributeManager(this._gl);
			this.programCache = new ProgramManager(this);
	}

	getContext() {
		return this._gl;
	}

	setPixelRatio(v) {
		this._pixelRatio = v;
		this.setSize(this._width, this._height);
	}

	setSize(width, height) {
		this._width = width;
		this._height = height;
		this.canvas.width = Math.floor(width * this._pixelRatio);
		this.canvas.height = Math.floor(height * this._pixelRatio);
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		this._gl.viewport(0, 0, width, height);
	}

	renderBufferDirect(c, s, g, m, o) {
			this.setProgram(c, s, g, m, o);
			this._gl.bindVertexArray(this._gl.createVertexArray());
			this.attributes.update(g.index, this._gl.ELEMENT_ARRAY_BUFFER);
			const at = this.attributes.get(g.attributes['position']);
			this._gl.enableVertexAttribArray(0);
			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, at.buffer);
			this._gl.vertexAttribPointer(0, 3, 5126, false, 12, 0);
			this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this.attributes.get(g.index).buffer);
			this._gl.drawElements(4, 6, 5123, 0);
	}

	render(scene, camera) {
		this.projectObject(scene, camera);
		this.renderObjects(this.currentRenderList, scene, camera);
		this.currentRenderList = [];
	}

	projectObject(object, camera) {
			if (object.isQuad) {
				const attr = object.geometry.attributes;
				for (const name in attr) {
					this.attributes.update(attr[name], this._gl.ARRAY_BUFFER);
				}
				this.currentRenderList.push({
						object: object,
						geometry: object.geometry,
						material: object.material
				});
			}
		const children = object.children;
		for (let i = 0, l = children.length; i < l; i++) {
			this.projectObject(children[i], camera);
		}
	}

	renderObjects(renderList, scene, camera) {
		for (let i = 0, l = renderList.length; i < l; i++) {
			const ri = renderList[i];
			this.renderBufferDirect(camera, scene, ri.geometry, ri.material, ri.object);
		}
	}

	getUniformList(materialProperties) {
		if (materialProperties.uniformsList === null) {
			const progUniforms = materialProperties.currentProgram.getUniforms();
			materialProperties.uniformsList = UniformManager.seqWithValue(progUniforms.seq, materialProperties.uniforms);
		}
		return materialProperties.uniformsList;
	}

	getProgram(material, scene, object) {
		const materialProperties = this.properties.get(material);
		const parameters = this.programCache.getParameters(material, scene, object);
		const programCacheKey = this.programCache.getProgramCacheKey(parameters);
		let programs = new Map();
		materialProperties.programs = programs;
		let program = programs.get(programCacheKey);
		program = this.programCache.acquireProgram(parameters, programCacheKey);
		programs.set(programCacheKey, program);
		materialProperties.uniforms = material.uniforms;
		materialProperties.currentProgram = program;
		materialProperties.uniformsList = null;
		return program;
	}

	useProgram(program) {
		if (this.currentProgram !== program) {
			this._gl.useProgram(program);
			this.currentProgram = program;
			return true;
		}
		return false;
	}

	setProgram(camera, scene, geometry, material, object) {
		this.textures.resetTextureUnits();
		const materialProperties = this.properties.get( material );
		let needsProgramChange = false;
		if (material.version !== materialProperties.__version) {
			needsProgramChange = true;
			materialProperties.__version = material.version;
		}
		let program = materialProperties.currentProgram;
		if (needsProgramChange) {
			program = this.getProgram( material, scene, object );
		}
		let refreshProgram = false;
		const m_uniforms = materialProperties.uniforms;
		if (this.useProgram(program.program)) {
			refreshProgram = true;
		}
		UniformManager.upload(this._gl, this.getUniformList(materialProperties), m_uniforms, this.textures);
		return program;
	}

	setRenderTarget(renderTarget) {
		let framebuffer = null;
		if (renderTarget) {
			this.textures.setupRenderTarget(renderTarget);
			framebuffer = this.properties.get(renderTarget).__webglFramebuffer;
		}
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
	}
}

export { Renderer };
