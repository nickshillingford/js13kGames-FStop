import { UniformManager } from './UniformManager.js';

let _id$1 = 0;
let programIdCount = 0;

class WebGLShaderCache {
	constructor() {
		this.shaderCache = new Map();
	}

	getFragID(material) {
		return this._getShaderStage(material.fragmentShader).id;
	}

	_getShaderStage(code) {
		const cache = this.shaderCache;
		let stage = cache.get(code);
		if (stage === undefined) {
			stage = new WebGLShaderStage(code);
			cache.set(code, stage);
		}
		return stage;
	}
}

class WebGLShaderStage {
	constructor(code) {
		this.id = _id$1++;
	}
}

function WebGLShader( gl, type, string ) {
	const shader = gl.createShader( type );
	gl.shaderSource( shader, string );
	gl.compileShader( shader );
	return shader;
}

function WebGLProgram( renderer, cacheKey, parameters ) {
	const gl = renderer.getContext();
	const program = gl.createProgram();
	const glVertexShader = WebGLShader( gl, gl.VERTEX_SHADER, parameters.vertexShader );
	const glFragmentShader = WebGLShader( gl, gl.FRAGMENT_SHADER, parameters.fragmentShader );

	gl.attachShader( program, glVertexShader );
	gl.attachShader( program, glFragmentShader );
	gl.linkProgram( program );

	function onFirstUse( self ) {
		gl.deleteShader( glVertexShader );
		gl.deleteShader( glFragmentShader );
		cachedUniforms = new UniformManager(gl, program);
	}

	let cachedUniforms;

	this.getUniforms = function () {
		if ( cachedUniforms === undefined ) {
			onFirstUse( this );
		}
		return cachedUniforms;
	}

	this.id = programIdCount++;
	this.cacheKey = cacheKey;
	this.program = program;
	this.vertexShader = glVertexShader;
	this.fragmentShader = glFragmentShader;

	return this;
}

function ProgramManager(renderer) {
	const _customShaders = new WebGLShaderCache();
	const programs = [];

	function getParameters(material, scene, object) {
		let customFragmentShaderID = _customShaders.getFragID( material );
		const parameters = {
			vertexShader: material.vertexShader,
			fragmentShader: material.fragmentShader,
			customFragmentShaderID: customFragmentShaderID
		};
		return parameters;
	}

	function getProgramCacheKey( parameters ) {
		return [parameters.customFragmentShaderID];
	}

	function acquireProgram( parameters, cacheKey ) {
		let program;
		for ( let p = 0, pl = programs.length; p < pl; p ++ ) {
			const preexistingProgram = programs[ p ];
			if ( preexistingProgram.cacheKey === cacheKey ) {
				program = preexistingProgram;
				break;
			}
		}

		if ( program === undefined ) {
			program = new WebGLProgram( renderer, cacheKey, parameters );
			programs.push( program );
		}

		return program;
	}

	return {
		getParameters: getParameters,
		getProgramCacheKey: getProgramCacheKey,
		acquireProgram: acquireProgram,
		programs: programs
	}
}

export { ProgramManager };
