import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
import {load_object_gltf, delete_lights, add_lights, load_world} from '../common_functions.js';

var renderer, scene, camera;
var Model;
var name_enemy = "enemy";
var tween_torso = null;
var tween_arm = {dx:null,sx:null};
var tween_leg = {up:{dx:null,sx:null},down:{dx:null,sx:null}};
var loaded = false;
var destroyed = false;
var lightPortal = false;
var dirLight, lightAmbient;
var ArmDx, LegDx, LegSx, LegDx_Down, LegSx_Down;

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
    camera = new THREE.PerspectiveCamera(100,
      window.innerWidth/window.innerHeight, 0.1, 1000);
  
    //Loaders
    load_object_gltf(scene, name_enemy,true,'./woodsman.gltf',0,-2,-15,0,90,0);
  }

    //Animation
    var animate = function () {
    requestAnimationFrame(animate);
    end_of_level();
    if(loaded) enemy_animation();
    if (scene.getObjectByName(name_enemy) && !loaded) {
      Model = scene.getObjectByName(name_enemy);
      ArmDx = Model.getObjectByName('ArmDX');
      LegDx = Model.getObjectByName('LegDX');
      LegSx = Model.getObjectByName('LegSX');
      LegDx_Down = Model.getObjectByName('LegDXDown');
      LegSx_Down = Model.getObjectByName('LegSXDown');
      if(Model) tween_torso = {position:new createjs.Tween.get(Model.position),rotation:new createjs.Tween.get(Model.rotation)};
      if(ArmDx) tween_arm.dx = {position:new createjs.Tween.get(ArmDx.position),rotation:new createjs.Tween.get(ArmDx.rotation)};
      if(LegDx) tween_leg.up.dx = {position:new createjs.Tween.get(LegDx.position),rotation:new createjs.Tween.get(LegDx.rotation)};
      if(LegSx) tween_leg.up.sx = {position:new createjs.Tween.get(LegSx.position),rotation:new createjs.Tween.get(LegSx.rotation)};
      if(LegSx_Down) tween_leg.down.dx = {position:new createjs.Tween.get(LegDx_Down.position),rotation:new createjs.Tween.get(LegDx_Down.rotation)};
      if(LegDx_Down) tween_leg.down.sx = {position:new createjs.Tween.get(LegSx_Down.position),rotation:new createjs.Tween.get(LegSx_Down.rotation)};
      
      if(Model && ArmDx && LegDx && LegSx && LegDx_Down && LegSx_Down)loaded = true
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
      if(destroyed && !lightPortal){
        delete_lights(scene,dirLight,lightAmbient);
        load_object_gltf(scene, 'spotlight', false, './Spotlight/spotlight.gltf', 0, 0, 0, 0, -90, 0);
        load_world(scene, camera, './nature.obj','./nature.mtl',0,26,200);
        lightPortal = true;
      }
      if(!destroyed && lightPortal){
        var spotlight = scene.getObjectByName('spotlight')
        add_lights(scene,dirLight,lightAmbient,spotlight)
        lightPortal = false;
      }
    }
    
    function prepare_shot(){
      tween_arm.dx.rotation.to({x: THREE.Math.degToRad(-70), z: THREE.Math.degToRad(180)}, 1000);
      tween_arm.dx.position.to({x: -0.9, y: 0.4, z: 0.8},1000);
    }
    // da rivedere
    function walk(){
      var degree = 4.4;
      var to_go = {x:10,z:14}
      if(to_go.x - Model.initial_position.x != 0) var rot = (to_go.z - Model.initial_position.z)/(to_go.x - Model.initial_position.x);
      else var rot = 0;
      console.log(Model.rotation.y,rot)
      if(Model.position.x < to_go.x || Model.position.z < to_go.z){
        tween_leg.up.dx.rotation.paused = false
        tween_leg.up.sx.rotation.paused = false
        tween_leg.up.dx.position.paused = false
        tween_leg.up.sx.position.paused = false
        tween_leg.up.dx.rotation.to({x: THREE.Math.degToRad(-degree)},1000).to({x: THREE.Math.degToRad(degree)},1000);
        tween_leg.up.sx.rotation.to({x: THREE.Math.degToRad(degree)},1000).to({x: THREE.Math.degToRad(-degree)},1000);
        tween_leg.up.dx.position.to({z: -0.2},1000).to({z: 0.2},1000);
        tween_leg.up.sx.position.to({z: 0.2},1000).to({z: -0.2},1000);
        // va rivista non è corretta!!!
        if(rot > 0) Model.rotation.y =  Model.initial_rotation.y - rot
        else Model.rotation.y = -Model.initial_rotation.y + rot
      }
      else{
        tween_leg.up.dx.rotation.paused = true
        tween_leg.up.sx.rotation.paused = true
        tween_leg.up.dx.position.paused = true
        tween_leg.up.sx.position.paused = true
        LegDx.rotation.x = 0;
        LegSx.rotation.x = 0;
        LegDx.position.z = 0;
        LegSx.position.z = 0;

      }
      tween_torso.position.to(to_go,12000)
    }

    function enemy_animation(){
      prepare_shot()
      walk()
    }

    init();
    animate();