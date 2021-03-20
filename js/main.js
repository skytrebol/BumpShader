//import * as THREE from './js/three.r126.min.js';
//import { GLTFLoader } from '../js/three.js/examples/jsm/loaders/GLTFLoader_HACK.js';

import Stats from './stats.module.js';
//import { GUI } from '../js/three.js/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from './OrbitControls.js';
//import { OBJLoader } from '../js/three.js/examples/jsm/loaders/OBJLoader.js';
import { BumpMesh } from './BumpMesh.js?1';


var THREE = window.THREE;


/*
 * Cloth Simulation using a relaxed constraints solver
 */

var container, stats;
var camera, scene, renderer;
var clock;

// Texture Loader
const loader = new THREE.TextureLoader();

//Three Map
var msize = 2000;
var map = new Array();

var lm=null;


init();


function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene
    scene = new THREE.Scene();


    scene.background = new THREE.Color( 0xcce0ff );
    //NO-FOG	scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );


    // camera
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set( 1000, 50, 1500 );
//    camera.position.set( 1000, 2, 1500 );
    camera.layers.enable( 0 );
    camera.layers.enable( 1 );

    // base lights
    scene.add( new THREE.AmbientLight( 0x666666 ) );

    // lights
    const light = new THREE.DirectionalLight( 0xdfebff, 1 + 9 );
    ///light.position.set( 50, 200, 100 );
    ///light.position.multiplyScalar( 1.3 );
    light.position.set( 0.5, 3, 1 );
    light.position.multiplyScalar( 100 );
//    light.layers.set( 1 );

    light.castShadow = true;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;

    const d = 750;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    light.shadow.camera.far = 2000;
    scene.add( light );


    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } ); //, alpha: true
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 10;
    controls.maxDistance = 5000;

    // performance monitor
    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );

    var Geo = new THREE.PlaneBufferGeometry( 1024, 1024, 256, 256 );
    //var Material = new THREE.MeshBasicMaterial( { visible: false, side: THREE.FrontSide} );
    var Material = new THREE.MeshBasicMaterial( {color: 0x202020,  wireframe: true} ); //debug
    //var Material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    var obj = new THREE.Mesh(Geo,Material);
    obj.position.set(0,-10,0);
    obj.rotation.x = - Math.PI / 2;
    scene.add(obj)


    // ground
    init_ground( );

    //animate
    animate( 0 );
}




var mesh;
var terrainTexture;
var bumpTexture;

function init_ground(){
    terrainTexture = loader.load(
	//"./img/13.jpg",
	"./img/pebble1.jpg",
	//"./img/pebble2.jpg",
	function ( _terrainTexture ) {
	    _terrainTexture.wrapS = _terrainTexture.wrapT = THREE.RepeatWrapping;
	    _terrainTexture.anisotropy = 16;
	    bumpTexture = loader.load(
		//"./img/13_HM.jpg",
		"./img/pebble1_HM.jpg",
		//"./img/pebble2_HM.jpg",
		function ( _bumpTexture ) {
		    _bumpTexture.wrapS = _bumpTexture.wrapT = THREE.RepeatWrapping;
		    _bumpTexture.anisotropy = 16;
		    //const meshGeometry = new THREE.PlaneBufferGeometry( 1024, 1024, 256, 256 );
		    const meshGeometry = new THREE.PlaneBufferGeometry( 1024, 1024, 64, 64 );
		    //const meshGeometry = new THREE.PlaneBufferGeometry( 1024, 1024, 32, 32 );
		    //const meshGeometry = new THREE.PlaneBufferGeometry( 1024, 1024, 1, 1 );
		    //material.map.repeat.set( .25, .25 );
		    
		    mesh = new BumpMesh(
			meshGeometry, {
			    textureWidth: 512,
			    textureHeight: 512,
			    side: THREE.FrontSide,
			    //side: THREE.DoubleSide,
			    bumpTexture:_bumpTexture,
			    //bumpScale:50,
			    bumpScale:15,
			    terrainTexture:_terrainTexture
			}
		    );
		    mesh.rotation.x = - Math.PI / 2;
		    mesh.position.set(0, 0, 0);
		    //mesh.layers.set( 0 );
		    //set_layer(mesh, 1)
		    //mesh.castShadow = true;
		    //mesh.needsUpdate = true;
		    //atmos.set_target( mesh );
		    
		    scene.add( mesh );

		});
	});
	    
}


function animate_mesh(_delta){
    if( mesh ){
	mesh.update({time:(1.0 / 90.0)});
    }
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    
}

function set_layer(_model, _layer) {
    _model.layers.set( _layer );
    for(let i = 0; i < _model.children.length; i++){
        set_layer( _model.children[i], _layer );
    }
}


//

function animate( now ) {
    clock = new THREE.Clock();
    let delta = clock.getDelta();
    
    requestAnimationFrame( animate );
    if(stats){stats.update();}

    //animate_mesh(delta);

    renderer.render( scene, camera );
}

