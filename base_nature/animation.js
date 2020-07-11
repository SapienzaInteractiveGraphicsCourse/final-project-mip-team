import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
import {load_world,load_object_gltf} from '../common_functions.js';

var renderer, scene, camera;
var objects = [];
var modelId;
function init(){
    //Create the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.GammaEncoding;
    document.body.appendChild( renderer.domElement );

    //Create the scene
    scene = new THREE.Scene();
          scene.background = new THREE.Color( 0x74D7FF );
    /* Lights */
    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( - 1, 1.75, 1 );
    dirLight.position.multiplyScalar( 30 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    var d = 50;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    scene.add( hemiLight );

    var lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( lightAmbient );

    //Camera
    camera = new THREE.PerspectiveCamera(35,
      window.innerWidth/window.innerHeight, 0.1, 1000);
    //

    //Loaders
    modelId = load_world(scene,camera,objects,'./enemy2.obj','./enemy2.mtl',0,0,20);
  }

    //Animation
    var animate = function () {
    requestAnimationFrame(animate);
    if(scene.children[modelId]) scene.children[modelId].rotation.y += 0.05;
    renderer.render(scene, camera);
    }
    init();
    animate();