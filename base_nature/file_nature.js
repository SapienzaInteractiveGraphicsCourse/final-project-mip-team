    //Import library and loaders easiest way: link to unpkg website
    import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
    import { PointerLockControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/PointerLockControls.js';
    import {load_world, onKeyUp, onKeyDown, check_collisions, load_object_gltf, weapon_movement, create_bullet, add_crosshair, delete_lights, add_lights} from '../common_functions.js';

    var renderer, scene, camera, controls;
    var objects = [];
    var raycaster;

    var movements = [false,false,false,false,false];

    var hemiLight, dirLight, lightAmbient;

    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();
    var start_position_player = {x:-87, y:3, z:29}
    var start_rotation_player = {x:0, y:-1.52, z:0}

    var healthBarCharacter, healthBarEnemy;
    var died_enemy = false;
    var died = false;
    var characterLifes = 10;
    var enemyLifes = 2;

    var lightOnOff = false;

    var crosshair;
    var crossColorReady = 0xAAFFAA;
    var crossColorWait = 0xC9302C;


    var collisions = [];
    collisions['front'] = 1;
    collisions['back'] = 1;
    collisions['left'] = 1;
    collisions['right'] = 1;
    var collisionDistance = 10;

    var url_string = window.location.href;
    var url = new URL(url_string);
    var get_light = url.searchParams.get("light");
    var get_sex = url.searchParams.get("sex")

    //  window.location.href = '../index_castle.html?light=' + get_light+ '&sex='+get_sex;
    //  window.location.href = '../index_final_negative.html?light=' + get_light+ '&sex='+get_sex;

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
    var name_enemy_2 = 'enemy2'
    var name_bullet_enemy = 'bullet_enemy'
    var name_bullet_enemy_2 = 'bullet_enemy2'

    var tween_torso = null;
    var tween_arm = {dx:null,sx:null};
    var tween_leg = {up:{dx:null,sx:null},down:{dx:null,sx:null}};
    var loaded_1 = false;
    var Model;
    var ArmDx, LegDx, LegSx, LegDx_Down, LegSx_Down;

    var tween_torso_2 = null;
    var tween_arm_2 = {dx:null,sx:null};
    var tween_leg_2 = {up:{dx:null,sx:null},down:{dx:null,sx:null}};
    var loaded_2 = false;
    var Model_2;
    var ArmDx_2, LegDx_2, LegSx_2, LegDx_Down_2, LegSx_Down_2;

    var bulletPositionEnemy;
    var bulletLoadedEnemy = false;
    var toPosXEnemy, toPosYEnemy, toPosZEnemy;
    var time_shoting_rate = 0;
    var enemy_shoting_1 = false;
    var canShotEnemy1 = false;
    var canShot = false;

    var blocker, instructions;

    function controller(){
      controls = new PointerLockControls( camera, document.body );
				blocker = document.getElementById( 'blocker' );
				instructions = document.getElementById( 'instructions');
				instructions.addEventListener( 'click', function () {
          controls.lock();
				}, false );

				controls.addEventListener( 'lock', function () {
					instructions.style.display = 'none';
					blocker.style.display = 'none';
          canShotEnemy1 = true;
          canShot = true;
				} );

				controls.addEventListener( 'unlock', function () {
					blocker.style.display = 'block';
					instructions.style.display = '';
          canShotEnemy1 = false;
          canShot = false;
				} );

				scene.add( controls.getObject() );

				document.addEventListener( 'keydown', (event) => {onKeyDown(event,movements);}, false );
        document.addEventListener( 'keyup', (event) => {onKeyUp(event,movements);}, false );
        document.addEventListener( 'click', (event) => {
          if(canShot && event.which == 1) movements[4] = true;
        }, false );

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

      hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
      hemiLight.color.setHSL( 0.6, 1, 0.6 );
      scene.add( hemiLight );

      lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
      scene.add( lightAmbient );

      //Camera
      camera = new THREE.PerspectiveCamera(25,
        window.innerWidth/window.innerHeight, 0.1, 1000);
      

      //Loaders
      camera.rotation.y = start_rotation_player.y
      load_world(scene, camera, './nature.obj','./nature.mtl', start_position_player.x, start_position_player.y, start_position_player.z);
      load_object_gltf(scene, name_gun,false,'./gun.gltf',0,4,-15,0,45,0);
      load_object_gltf(scene, name_enemy,true,'./woodsman.gltf',0,0,-15,0,90,0);

      document.getElementById("lightOnOff").onclick = function() {
        lightOnOff = !lightOnOff;
        if(lightOnOff) {
          delete_lights( scene, hemiLight, lightAmbient);
        }
        else {
          add_lights (scene, hemiLight, lightAmbient);
        }
      };

      crosshair = add_crosshair(crosshair, camera, collisionDistance, crossColorReady, 0.06, 0.06);
      
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



        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y += (velocity.y * delta );

        if ( controls.getObject().position.y < start_position_player.y ) {
          velocity.y = 0;
          controls.getObject().position.y = start_position_player.y;
        }
        prevTime = time;

      }
    }
    function shoting(){
      camera.getWorldDirection(worldDirection2);
      raycasterOrigin2 = new THREE.Vector3(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
      raycaster2.set(raycasterOrigin2, worldDirection2);
      intersect = raycaster2.intersectObjects( scene.children, true );
      if (typeof intersect[5] !== 'undefined') {
        if (movements[4] == true) {
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
          movements[4] = false;
        }
        if (bulletModel && !bulletLoaded) {
          crosshair.material = new THREE.LineBasicMaterial({ color: crossColorWait });
          bulletPosition = new createjs.Tween.get(bulletModel.position);
          toPosX = intersect[5].point.x;
          toPosY = intersect[5].point.y;
          toPosZ = intersect[5].point.z;
          bulletLoaded = true;
        }
        if (scene.getObjectByName(name_bullet) && bulletLoaded) {
          bulletPosition.to({x:toPosX, y:toPosY, z:toPosZ}, time_shoting);
    
          if ((scene.getObjectByName(name_bullet).position.x == toPosX) && 
          (scene.getObjectByName(name_bullet).position.y == toPosY) &&
          (scene.getObjectByName(name_bullet).position.z == toPosZ)){
            if((intersect[5].object.name !== name_bullet) &&  (scene.getObjectByName(name_enemy)) &&
            (typeof (scene.getObjectByName(name_enemy)).getObjectByName(intersect[5].object.name) !== 'undefined')){
              console.log(intersect[5].object.name);
              if(intersect[5].object.name == 'Head' || 
              intersect[5].object.name == 'Hat' || 
              intersect[5].object.name == 'LIps' || 
              intersect[5].object.name == 'EyeDx' || 
              intersect[5].object.name == 'EyeSx' || 
              intersect[5].object.name == 'Hair'){
                enemyLifes -= 2;
              }
              else enemyLifes -= 1;
              /*if(enemyLifes < 2){
                load_object_gltf(scene, name_enemy_2,false,'./woodsman.gltf',0,0,15,0,90,0);
              }*/
              if(enemyLifes == 0) {
                scene.remove(scene.getObjectByName(name_enemy));
                scene.remove(scene.getObjectByName(name_bullet_enemy));
                console.log('Morto');
                died_enemy = true;
                canShotEnemy1 = false;
                delete_lights(scene, dirLight, lightAmbient);
                if (lightOnOff) {
                  scene.add(hemiLight);
                }
                // Add spotlight
                load_object_gltf(scene, 'spot', false, './spotlight.gltf', 76, 20,-97, 0, -90, 0);
                console.log(scene.getObjectByName('spot'))
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
      if(scene.getObjectByName('world') && scene.getObjectByName(name_enemy) && scene.getObjectByName(name_gun)) $(".loader").fadeOut("slow");
      if((camera.position.x >= 72.50) && (camera.position.z <= -88.28)) {
        window.location.href = '../base_castle/index_castle.html?light=' + get_light+ '&sex='+get_sex;
        $(".loader").fadeIn("slow");
      }
      loading_first_enemy()
      loading_second_enemy()
      check_collisions(controls, camera, scene, collisions, collisionDistance);
      weapon_movement(scene,camera,name_gun, 0.6, -0.3, -3);
      shoting();
      healthBarCharacter = document.getElementById("healthBarCharacter");
      healthBarCharacter.style.width = characterLifes*10 + "%";
      if(characterLifes >= 8) {
        healthBarCharacter.style.background = "green";
      }
      if(characterLifes <= 3) {
        healthBarCharacter.style.background = "red";
      }
      if (characterLifes < 8 && characterLifes > 3) {
        healthBarCharacter.style.background = "orange";
      }
      healthBarCharacter.innerHTML = characterLifes*10 +"%";
      
    
      healthBarEnemy = document.getElementById("healthBarEnemy");
      healthBarEnemy.style.width = enemyLifes*10 + "%";
      if(enemyLifes >= 8) {
        healthBarEnemy.style.background = "green";
      }
      if(enemyLifes <= 3) {
        healthBarEnemy.style.background = "red";
      }
      if (enemyLifes < 8 && enemyLifes > 3) {
        healthBarEnemy.style.background = "orange";
      }
      healthBarEnemy.innerHTML = enemyLifes*10 +"%";
      renderer.render(scene, camera);
      
    }
    function prepare_shot(tweenArm){
      tweenArm.dx.rotation.to({x: THREE.Math.degToRad(-70), z: THREE.Math.degToRad(180)}, 1000);
      tweenArm.dx.position.to({x: -0.9, y: 0.4, z: 0.8},1000);
    }
    function rotate_enemy(which_enemy){
     if(scene.getObjectByName(which_enemy)) scene.getObjectByName(which_enemy).lookAt(camera.position);
      
    }

    function walk(){
      var distance = 15;
      var degree = 4.4;
      if((Model.position.x > Model.initial_position.x - 2*distance || Model.position.z > Model.initial_position.z + distance) && tween_leg.up.dx && tween_leg.up.sx){
        tween_leg.up.dx.rotation.paused = false
        tween_leg.up.sx.rotation.paused = false
        tween_leg.up.dx.position.paused = false
        tween_leg.up.sx.position.paused = false
        tween_leg.up.dx.rotation.to({x: THREE.Math.degToRad(-degree)},1000).to({x: THREE.Math.degToRad(degree)},1000);
        tween_leg.up.sx.rotation.to({x: THREE.Math.degToRad(degree)},1000).to({x: THREE.Math.degToRad(-degree)},1000);
        tween_leg.up.dx.position.to({z: -0.2},1000).to({z: 0.2},1000);
        tween_leg.up.sx.position.to({z: 0.2},1000).to({z: -0.2},1000);
      }
      else if(tween_leg.up.dx && tween_leg.up.sx){
        tween_leg.up.dx.rotation.paused = true
        tween_leg.up.sx.rotation.paused = true
        tween_leg.up.dx.position.paused = true
        tween_leg.up.sx.position.paused = true
        LegDx.rotation.x = 0;
        LegSx.rotation.x = 0;
        LegDx.position.z = 0;
        LegSx.position.z = 0;
      }
      if(tween_torso) tween_torso.position.to({x:Model.initial_position.x - 2*distance,z:Model.initial_position.z + distance},12000)
    }

    function shot_enemy(which_enemy, which_bullet){
      var weaponModelEnemy = scene.getObjectByName(which_enemy);
      if (enemy_shoting_1 == true) {
          create_bullet(scene,which_bullet,0.02)
          // To move the gun together with the camera, but translated of the right position
          if (scene.getObjectByName(which_bullet)) {
            var bulletModelEnemy = scene.getObjectByName(which_bullet);
            if(weaponModelEnemy){
              bulletModelEnemy.position.copy( weaponModelEnemy.position);
              bulletModelEnemy.rotation.copy( weaponModelEnemy.rotation);
              bulletModelEnemy.translateX( -0.65);
              bulletModelEnemy.translateY( 2.85);
              bulletModelEnemy.translateZ( 2);
            }
          } 
        enemy_shoting_1 = false;
      }
      if (bulletModelEnemy && !bulletLoadedEnemy) {
        bulletPositionEnemy = new createjs.Tween.get(bulletModelEnemy.position);
        toPosXEnemy = camera.position.x;
        toPosYEnemy = camera.position.y;
        toPosZEnemy = camera.position.z;
        bulletLoadedEnemy = true;
      }
      if (scene.getObjectByName(which_bullet) && bulletLoadedEnemy) {
        bulletPositionEnemy.to({x:toPosXEnemy, y:toPosYEnemy, z:toPosZEnemy}, time_shoting);
        if ((scene.getObjectByName(which_bullet).position.x == toPosXEnemy) && 
        (scene.getObjectByName(which_bullet).position.y == toPosYEnemy) &&
        (scene.getObjectByName(which_bullet).position.z == toPosZEnemy)){
          if(camera.position.x == toPosXEnemy && camera.position.y == toPosYEnemy && camera.position.z == toPosZEnemy){
            console.log('Preso')
            characterLifes -= 1;
            if(characterLifes == 0) {
              console.log('Game over');
              died = true;
              window.location.href = '../index_final_negative.html?light=' + get_light+ '&sex='+get_sex;
            }
          }
          scene.remove(scene.getObjectByName(which_bullet));
          bulletLoadedEnemy = false;
        }
      }
    }

    function enemy_animation(){
      prepare_shot(tween_arm)
      walk()
      rotate_enemy(name_enemy)
      if(canShotEnemy1) time_shoting_rate += 1;
      if(time_shoting_rate / 100 == 1) {
        enemy_shoting_1 = true;
        time_shoting_rate = 0;
      }
      shot_enemy(name_enemy,name_bullet_enemy)
    }
    function enemy_animation_2(){
      prepare_shot(tween_arm_2)
      rotate_enemy(name_enemy_2)
    }
    function loading_first_enemy(){
      
      if(loaded_1) enemy_animation();
      if (scene.getObjectByName(name_enemy) && !loaded_1) {
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
        if(Model && ArmDx && LegDx && LegSx && LegDx_Down && LegSx_Down)loaded_1 = true
      }
    }
    function loading_second_enemy(){
      if(loaded_2) enemy_animation_2();
      if (scene.getObjectByName(name_enemy_2) && !loaded_2) {
        Model_2 = scene.getObjectByName(name_enemy_2);
        ArmDx_2 = Model_2.getObjectByName('ArmDX');
        LegDx_2 = Model_2.getObjectByName('LegDX');
        LegSx_2 = Model_2.getObjectByName('LegSX');
        LegDx_Down_2 = Model_2.getObjectByName('LegDXDown');
        LegSx_Down_2 = Model_2.getObjectByName('LegSXDown');
        if(Model_2) tween_torso_2 = {position:new createjs.Tween.get(Model_2.position),rotation:new createjs.Tween.get(Model_2.rotation)};
        if(ArmDx_2) tween_arm_2.dx = {position:new createjs.Tween.get(ArmDx_2.position),rotation:new createjs.Tween.get(ArmDx_2.rotation)};
        if(LegDx_2) tween_leg_2.up.dx = {position:new createjs.Tween.get(LegDx_2.position),rotation:new createjs.Tween.get(LegDx_2.rotation)};
        if(LegSx_2) tween_leg_2.up.sx = {position:new createjs.Tween.get(LegSx_2.position),rotation:new createjs.Tween.get(LegSx_2.rotation)};
        if(LegSx_Down_2) tween_leg_2.down.dx = {position:new createjs.Tween.get(LegDx_Down_2.position),rotation:new createjs.Tween.get(LegDx_Down_2.rotation)};
        if(LegDx_Down_2) tween_leg_2.down.sx = {position:new createjs.Tween.get(LegSx_Down_2.position),rotation:new createjs.Tween.get(LegSx_Down_2.rotation)};
        if(Model_2 && ArmDx_2 && LegDx_2 && LegSx_2 && LegDx_Down_2 && LegSx_Down_2)loaded_2 = true
      }
    }
    init();
    animate();