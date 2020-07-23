    //Import library and loaders easiest way: link to unpkg website
    import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
    import { PointerLockControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/PointerLockControls.js';
    import {load_world, onKeyUp, onKeyDown, check_collisions, load_object_gltf, weapon_movement, create_bullet} from '../common_functions.js';

    var renderer, scene, camera, controls;
    var objects = [];
    var raycaster;

    var movements = [false,false,false,false,false,false];

    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();
    var start_position_player = {x:-87, y:3, z:29}
    var start_rotation_player = {x:0, y:-1.52, z:0}

    var collisions = [];
    collisions['front'] = 1;
    collisions['back'] = 1;
    collisions['left'] = 1;
    collisions['right'] = 1;
    var collisionDistance = 10;

    //for bullet
    var bulletPosition;
    var bulletLoaded = false;
    var toPosX, toPosY, toPosZ;
    var worldDirection2 = new THREE.Vector3();
    var intersect, raycasterOrigin2;
    var raycaster2 = new THREE.Raycaster();
    var prevShot = performance.now();
    var nowShot = performance.now();
    var time_shoting = 2000;

    var name_gun = 'gun'
    var name_bullet = 'bullet'
    var name_enemy = 'enemy'
    var name_bullet_enemy = 'bullet_enemy'

    var tween_torso = null;
    var tween_arm = {dx:null,sx:null};
    var tween_leg = {up:{dx:null,sx:null},down:{dx:null,sx:null}};
    var loaded = false;
    var Model;
    var ArmDx, LegDx, LegSx, LegDx_Down, LegSx_Down;

    var bulletPositionEnemy;
    var bulletLoadedEnemy = false;
    var toPosXEnemy, toPosYEnemy, toPosZEnemy;
    var time_shoting_rate = 0;
    var enemy_shooting = false;
    var canShotEnemy = false;

    function controller(){
      controls = new PointerLockControls( camera, document.body );
				var blocker = document.getElementById( 'blocker' );
				var instructions = document.getElementById( 'instructions' );

				instructions.addEventListener( 'click', function () {
          controls.lock();
          canShotEnemy = true;
				}, false );

				controls.addEventListener( 'lock', function () {
					instructions.style.display = 'none';
					blocker.style.display = 'none';
				} );

				controls.addEventListener( 'unlock', function () {
					blocker.style.display = 'block';
					instructions.style.display = '';
				} );

				scene.add( controls.getObject() );

				document.addEventListener( 'keydown', (event) => {onKeyDown(event,movements,velocity);}, false );
				document.addEventListener( 'keyup', (event) => {onKeyUp(event,movements);}, false );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 20, 10 );
    }

    function init(){
      //Create the renderer
      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
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
      camera = new THREE.PerspectiveCamera(25,
        window.innerWidth/window.innerHeight, 0.1, 1000);
      

      //Loaders
      camera.rotation.y = start_rotation_player.y
      load_world(scene, camera, './nature.obj','./nature.mtl', start_position_player.x, start_position_player.y, start_position_player.z);
      load_object_gltf(scene, name_gun,false,'./gun.gltf',0,4,-15,0,45,0);
      load_object_gltf(scene, name_enemy,true,'./woodsman.gltf',0,0,-15,0,90,0);
      
      controller();
      


    }

    function motion(){
      if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects( objects );

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta;

        
        direction.z = collisions['front']*Number( movements[0] ) - collisions['back']*Number( movements[1] );
        direction.x = collisions['right']*Number( movements[3] ) - collisions['left']*Number( movements[2] );
        direction.normalize();

        if ( movements[0] || movements[1] ) velocity.z -= direction.z * 400.0 * delta;
        if ( movements[2] || movements[3] ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) {
          velocity.y = Math.max( 0, velocity.y );
          movements[4] = true;
        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y += (velocity.y * delta );

        if ( controls.getObject().position.y < start_position_player.y ) {
          velocity.y = 0;
          controls.getObject().position.y = start_position_player.y;
          movements[4] = true;
        }
        prevTime = time;

      }
    }
    function shoting(){
      camera.getWorldDirection(worldDirection2);
      raycasterOrigin2 = new THREE.Vector3(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
      raycaster2.set(raycasterOrigin2, worldDirection2);
      intersect = raycaster2.intersectObjects( scene.children, true );
      if (typeof intersect[0] !== 'undefined') {
        if (movements[5] == true) {
          var temp = nowShot;
          nowShot = performance.now()
          if((nowShot-prevShot) >= time_shoting){
            prevShot = temp;
            create_bullet(scene,name_bullet)
            // To move the gun together with the camera, but translated of the right position
            if (scene.getObjectByName(name_bullet)) {
              var bulletModel = scene.getObjectByName(name_bullet);
              var weaponModel = scene.getObjectByName(name_gun);
              bulletModel.position.copy( weaponModel.position );
              bulletModel.rotation.copy( weaponModel.rotation );
              bulletModel.translateX( -0.2 );
              bulletModel.translateY( 0.2 );
              bulletModel.translateZ( -2.2 );
            } 
          }
          movements[5] = false;
        }
        if (bulletModel && !bulletLoaded) {
          bulletPosition = new createjs.Tween.get(bulletModel.position);
          toPosX = intersect[0].point.x;
          toPosY = intersect[0].point.y;
          toPosZ = intersect[0].point.z;
          bulletLoaded = true;
        }
        if (scene.getObjectByName(name_bullet) && bulletLoaded) {
          bulletPosition.to({x:toPosX, y:toPosY, z:toPosZ}, time_shoting);
    
          if ((scene.getObjectByName(name_bullet).position.x == toPosX) && 
          (scene.getObjectByName(name_bullet).position.y == toPosY) &&
          (scene.getObjectByName(name_bullet).position.z == toPosZ)){
            if((intersect[0].object.name !== name_bullet) &&  (scene.getObjectByName(name_enemy)) &&
            (typeof (scene.getObjectByName(name_enemy)).getObjectByName(intersect[0].object.name) !== 'undefined')){
              console.log('Preso');
              enemyLifes -= 1;
              if(enemyLifes == 0) {
                scene.remove(scene.getObjectByName(name_enemy));
                console.log('Morto');
              }
            }
            scene.remove(scene.getObjectByName(name_bullet));
            bulletLoaded = false;
          }
        }
      }
    }
    //Animation
    var animate = function () {
      requestAnimationFrame( animate );
      motion();
      check_collisions(controls, camera, scene, collisions, collisionDistance);
      weapon_movement(scene,camera,name_gun, 0.6, -0.3, -3);
      shoting();
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
      renderer.render(scene, camera);
      
    }
    function prepare_shot(){
      tween_arm.dx.rotation.to({x: THREE.Math.degToRad(-70), z: THREE.Math.degToRad(180)}, 1000);
      tween_arm.dx.position.to({x: -0.9, y: 0.4, z: 0.8},1000);
    }
    // da rivedere
    function walk(){
      var distance_limit = 10;
      var degree = 4.4;
      if(camera.position.x - Model.initial_position.x != 0) var rot = (camera.position.z - Model.initial_position.z)/(camera.position.x - Model.initial_position.x);
      else var rot = 0;
      if(Model.position.x < camera.position.x + distance_limit || Model.position.z < camera.position.z - distance_limit){
        tween_leg.up.dx.rotation.paused = false
        tween_leg.up.sx.rotation.paused = false
        tween_leg.up.dx.position.paused = false
        tween_leg.up.sx.position.paused = false
        tween_leg.up.dx.rotation.to({x: THREE.Math.degToRad(-degree)},1000).to({x: THREE.Math.degToRad(degree)},1000);
        tween_leg.up.sx.rotation.to({x: THREE.Math.degToRad(degree)},1000).to({x: THREE.Math.degToRad(-degree)},1000);
        tween_leg.up.dx.position.to({z: -0.2},1000).to({z: 0.2},1000);
        tween_leg.up.sx.position.to({z: 0.2},1000).to({z: -0.2},1000);
        Model.rotation.y = camera.rotation.y
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
      tween_torso.position.to({x:camera.position.x + distance_limit,z:camera.position.z + distance_limit},12000)
    }

    function shot_enemy(){
      if (enemy_shooting == true) {
          create_bullet(scene,name_bullet_enemy)
          // To move the gun together with the camera, but translated of the right position
          if (scene.getObjectByName(name_bullet_enemy)) {
            var bulletModelEnemy = scene.getObjectByName(name_bullet_enemy);
            var weaponModelEnemy = scene.getObjectByName(name_enemy);
            bulletModelEnemy.position.copy( weaponModelEnemy.position);
            bulletModelEnemy.rotation.copy( weaponModelEnemy.rotation);
            bulletModelEnemy.translateX( -0.75);
            bulletModelEnemy.translateY( 2.8);
            bulletModelEnemy.translateZ( 2);
          } 
        enemy_shooting = false;
      }
      if (bulletModelEnemy && !bulletLoadedEnemy) {
        bulletPositionEnemy = new createjs.Tween.get(bulletModelEnemy.position);
        toPosXEnemy = camera.position.x;
        toPosYEnemy = camera.position.y;
        toPosZEnemy = camera.position.z;
        bulletLoadedEnemy = true;
      }
      if (scene.getObjectByName(name_bullet_enemy) && bulletLoadedEnemy) {
        bulletPositionEnemy.to({x:toPosXEnemy, y:toPosYEnemy, z:toPosZEnemy}, time_shoting);
        if ((scene.getObjectByName(name_bullet_enemy).position.x == toPosXEnemy) && 
        (scene.getObjectByName(name_bullet_enemy).position.y == toPosYEnemy) &&
        (scene.getObjectByName(name_bullet_enemy).position.z == toPosZEnemy)){
          if(camera.position.x == toPosXEnemy && camera.position.y == toPosYEnemy && camera.position.z == toPosZEnemy){
            console.log('Preso')
          }

          scene.remove(scene.getObjectByName(name_bullet_enemy));
          bulletLoadedEnemy = false;
        }
      }
    }

    function enemy_animation(){
      prepare_shot()
      //walk()
      if(canShotEnemy) time_shoting_rate += 1;
      if(time_shoting_rate / 100 == 1) {
        enemy_shooting = true;
        time_shoting_rate = 0;
      }
      shot_enemy()
    }
    init();
    animate();