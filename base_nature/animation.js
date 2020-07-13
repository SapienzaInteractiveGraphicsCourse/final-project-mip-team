import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
import {load_object_gltf, delete_lights, add_lights} from '../common_functions.js';

var renderer, scene, camera;
var Model;
var name_enemy = "enemy";
var tween_arm = {dx:null,sx:null};
var tween_leg = {up:{dx:null,sx:null},down:{dx:null,sx:null}};
var destroyed = false;
var lightOn = false;
var dirLight, lightAmbient;
function init(){
    //Create the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.GammaEncoding;
    document.body.appendChild( renderer.domElement );

    //Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x74D7FF );
    /* Lights */
    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
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

    lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( lightAmbient );

    //Camera
    camera = new THREE.PerspectiveCamera(50,
      window.innerWidth/window.innerHeight, 0.1, 1000);
  
    //Loaders
    load_object_gltf(scene, name_enemy,true,'./woodsman.gltf',0,-2,-15,0,45,0);
  }

    //Animation
    var animate = function () {
    requestAnimationFrame(animate);
    end_of_level();
    if (scene.getObjectByName(name_enemy)) {
      Model = scene.getObjectByName(name_enemy);
      var ArmDx = Model.getObjectByName('ArmDX');
      var LegDx = Model.getObjectByName('LegDX');
      var LegSx = Model.getObjectByName('LegSX');
      var LegDx_Down = Model.getObjectByName('LegDXDown');
      var LegSx_Down = Model.getObjectByName('LegSXDOwn');
      if(ArmDx) {
        tween_arm.dx = {position:new createjs.Tween(ArmDx.position),rotation:new createjs.Tween(ArmDx.rotation)};
        prepare_shot(tween_arm.dx)
      }
      if(LegDx && LegSx && LegSx_Down && LegDx_Down){
        tween_leg.up.dx = {position:new createjs.Tween(LegDx.position),rotation:new createjs.Tween(LegDx.rotation)};
        tween_leg.up.sx = {position:new createjs.Tween(LegSx.position),rotation:new createjs.Tween(LegSx.rotation)};
        tween_leg.down.dx = {position:new createjs.Tween(LegDx_Down.position),rotation:new createjs.Tween(LegDx_Down.rotation)};
        tween_leg.down.sx = {position:new createjs.Tween(LegSx_Down.position),rotation:new createjs.Tween(LegSx_Down.rotation)};
        walk(tween_leg)
      }
    }
    document.getElementById("destroy").onclick = function (event) {
      destroyed = !destroyed;
      if(Model && destroyed) {
        scene.remove(Model);
      }
    };
    renderer.render(scene, camera);
    }

    function end_of_level(){
      if(destroyed && !lightOn){
        delete_lights(scene,dirLight,lightAmbient);
        load_object_gltf(scene, 'spotlight', false, './Spotlight/spotlight.gltf', -10, 30, 50, 0, -90, 0);
        lightOn = true;
      }
      if(!destroyed && lightOn){
        var spotlight = scene.getObjectByName('spotlight')
        add_lights(scene,dirLight,lightAmbient,spotlight)
        lightOn = false;
      }
    }
    
    function prepare_shot(tween){
      tween.rotation.to({x: THREE.Math.degToRad(-70), z: THREE.Math.degToRad(180)}, 1000);
      tween.position.to({x: -0.9, y: 0.4, z: 0.8},1000);
    }
    // da rivedere
    function walk(tween){
      tween.up.dx.rotation.to({x: THREE.Math.degToRad(-30)},1000).to({x: THREE.Math.degToRad(30)},1000);
      tween.up.sx.rotation.to({x: THREE.Math.degToRad(30)},1000).to({x: THREE.Math.degToRad(-30)},1000);
      tween.up.dx.position.to({y:2.2 ,z: -1.8},1100).to({y:2.2 ,z: 1.8},1100);
      tween.up.sx.position.to({y:2.2 ,z: 1.8},1100).to({y:2.2 ,z: -1.8},1100);
    }

    init();
    animate();