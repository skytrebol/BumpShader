import { fragmentShader,vertexShader } from './shaders.js';

var Color = THREE.Color;
var FrontSide = THREE.FrontSide;
var LinearEncoding = THREE.LinearEncoding;
var LinearFilter = THREE.LinearFilter;
var MathUtils = THREE.MathUtils;
var Matrix4 = THREE.Matrix4;
var Mesh = THREE.Mesh;
var NoToneMapping = THREE.NoToneMapping;
var PerspectiveCamera = THREE.PerspectiveCamera;
var Plane = THREE.Plane;
var RGBFormat = THREE.RGBFormat;
var ShaderMaterial = THREE.ShaderMaterial;
var UniformsLib = THREE.UniformsLib;
var UniformsUtils = THREE.UniformsUtils;
var Vector3 = THREE.Vector3;
var Vector4 = THREE.Vector4;
var WebGLRenderTarget = THREE.WebGLRenderTarget;

/**
 * Work based on :
 * http://slayvin.net : Flat mirror for three.js
 * http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : BumpMesh shader explanations in WebGL
 */

var BumpMesh = function ( geometry, options ) {

	Mesh.call( this, geometry );

	var scope = this;

	options = options || {};

	var textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
	var textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

	var clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
	var time = options.time !== undefined ? options.time : 0.0;
	var normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
	var eye = options.eye !== undefined ? options.eye : new Vector3( 0, 0, 0 );
	var side = options.side !== undefined ? options.side : FrontSide;
        var terrainTexture = options.terrainTexture !== undefined ? options.terrainTexture : null;
        var bumpTexture = options.bumpTexture !== undefined ? options.bumpTexture : null;
        var bumpScale = 50;


	//

	var mirrorPlane = new Plane();
	var normal = new Vector3();
	var mirrorWorldPosition = new Vector3();
	var cameraWorldPosition = new Vector3();
	var rotationMatrix = new Matrix4();
	var lookAtPosition = new Vector3( 0, 0, - 1 );
	var clipPlane = new Vector4();

	var view = new Vector3();
	var target = new Vector3();
	var q = new Vector4();

	var textureMatrix = new Matrix4();

	var mirrorCamera = new PerspectiveCamera();

	var parameters = {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBFormat
	};

	var renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

	if ( ! MathUtils.isPowerOfTwo( textureWidth ) || ! MathUtils.isPowerOfTwo( textureHeight ) ) {

		renderTarget.texture.generateMipmaps = false;

	}

	var mirrorShader = {

		uniforms: UniformsUtils.merge( [
			UniformsLib[ 'fog' ],
			UniformsLib[ 'lights' ],
			{
				'normalSampler': { value: null },
				'mirrorSampler': { value: null },
				'time': { value: 0.0 },
				'size': { value: 1.0 },
				'textureMatrix': { value: new Matrix4() },
				'terrainTexture': { value: null },
				'bumpTexture': { value: null },
				'bumpScale': { value: 50.0 },
				'eye': { value: new Vector3() }
			}
		] ),

	    vertexShader: ["",""].join( '\n' ),
	    fragmentShader: ["",""].join( '\n' )

	};

	var material = new ShaderMaterial( {
	    fragmentShader: fragmentShader,
	    vertexShader: vertexShader,
	    uniforms: UniformsUtils.clone( mirrorShader.uniforms ),
	    lights: true,
	    side: side
	} );

	material.uniforms[ 'mirrorSampler' ].value = renderTarget.texture;
	material.uniforms[ 'textureMatrix' ].value = textureMatrix;
	material.uniforms[ 'time' ].value = time;
	material.uniforms[ 'normalSampler' ].value = normalSampler;
	material.uniforms[ 'terrainTexture' ].value = terrainTexture;
	material.uniforms[ 'bumpTexture' ].value = bumpTexture;
	material.uniforms[ 'bumpScale' ].value = bumpScale;

	material.uniforms[ 'eye' ].value = eye;

	scope.material = material;

};

BumpMesh.prototype = Object.create( Mesh.prototype );
BumpMesh.prototype.constructor = BumpMesh;
BumpMesh.prototype.update = function(_params){
    let _this = this;
    Object.keys(_params).forEach(function (_key) {
	if( _this.material.uniforms[ _key ] ){
	    if(_key == 'time'){
		//_this.material.uniforms[ 'time' ].value += 1.0 / 60.0;
		_this.material.uniforms[ 'time' ].value += _params[ _key ];
	    }else{
		_this.material.uniforms[ _key ].value = _params[ _key ];
	    }
	}
    });
}

export { BumpMesh };
