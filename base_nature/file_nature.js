    //Import library and loaders easiest way: link to unpkg website
    import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
    import { PointerLockControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/PointerLockControls.js';
    import {load_audio, load_world, onKeyUp, onKeyDown, check_collisions, load_object_gltf, weapon_movement, create_bullet, add_crosshair, delete_lights, add_lights} from '../common_functions.js';

    // ambient variables
    var renderer, scene, camera, controls;
    var raycaster;
    var hemiLight, dirLight, lightAmbient;
    // get values of user's preference and variables to store html div
    var url_string = window.location.href;
    var url = new URL(url_string);
    var get_light = url.searchParams.get("light");
    var get_sex = url.searchParams.get("sex");
    var blocker, instructions;
    // used to control user's movements
    var movements = [false,false,false,false,false]; //[up,down,left,right,shot]
    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();
    // variables for checking collisions with objects
    var collisions = [];
    collisions['front'] = 1;
    collisions['back'] = 1;
    collisions['left'] = 1;
    collisions['right'] = 1;
    var collisionDistance = 10;
    // initial position and rotation of user
    var start_position_player = {x:-87, y:3, z:29}
    var start_rotation_player = {x:0, y:-1.52, z:0}
    // variables for lives of user/enemies and dead of them
    var characterLifes = 10;
    var enemyLifes = 10;
    var enemyLifes2 = 10;
    var healthBarCharacter, healthBarEnemy, healthBarEnemy2;
    var died = false;
    var died_enemy = false;
    var died_enemy_2 = false;
    // variables for crosshair
    var crosshair;
    var crossColorReady = 0xE13BFD;
    var crossColorWait = 0xCE0F0A;
    // variables for sounds
    var soundGameOver;
    var soundArmy;
    // name of object loaded in the scene
    var name_gun = 'gun'
    var name_bullet = 'bullet'
    var name_enemy = 'enemy'
    var name_enemy_2 = 'enemy2'
    var name_bullet_enemy = 'bullet_enemy'
    var name_bullet_enemy_2 = 'bullet_enemy2'
    // variables used to store and check body part of enemies
    var loaded_1 = false, loaded_2 = false;
    var Model,Model_2;
    var ArmDx, LegDx, LegSx, LegDx_Down, LegSx_Down, ArmDx_2;
    var tween_torso = null;
    var tween_leg = {up:{dx:null,sx:null},down:{dx:null,sx:null}};
    // variables used when the user shots
    var bulletPosition;
    var bulletLoaded = false;
    var toPosX, toPosY, toPosZ;
    var worldDirection2 = new THREE.Vector3();
    var intersect, raycasterOrigin2;
    var raycaster2 = new THREE.Raycaster();
    var prevShot = performance.now();
    var nowShot = performance.now();
    var time_shooting = 200;
    var canShot = false;
    var damage = 0.75;
    // variables used when the enemies shot
    var bulletPositionEnemy, bulletPositionEnemy2;
    var bulletLoadedEnemy = false, bulletLoadedEnemy2 = false;
    var toPosXEnemy, toPosYEnemy, toPosZEnemy, toPosXEnemy2, toPosYEnemy2, toPosZEnemy2;
    var time_shooting_rate = 0, time_shooting_rate2 = 0;
    var enemy_shooting_1 = false,  enemy_shooting_2 = false;
    var canShotEnemy1 = false,  canShotEnemy2 = false;
    var damage_enemy1 = 1.25, damage_enemy2 = 1.75;
    // function toset up the controls for user's movements
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
          canShotEnemy2 = true;
          canShot = true;
				} );

				controls.addEventListener( 'unlock', function () {
					blocker.style.display = 'block';
					instructions.style.display = '';
          canShotEnemy1 = false;
          canShotEnemy2 = false;
          canShot = false;
				} );

				scene.add(controls.getObject());

				document.addEventListener( 'keydown', (event) => {onKeyDown(event,movements);}, false );
        document.addEventListener( 'keyup', (event) => {onKeyUp(event,movements);}, false );
        document.addEventListener( 'click', (event) => {
          if(canShot && event.which == 1) movements[4] = true;
        }, false );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 20, 10 );
    }
    // initialization of renderer, scene, lights, objects and so on
    function init(){
      // create the renderer
      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.outputEncoding = THREE.GammaEncoding;
      document.body.appendChild( renderer.domElement );
      // create the scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color( 0x74D7FF );
      // lights
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
      // up to user's preferences
      if(get_light=='night') {
        delete_lights( scene, hemiLight, lightAmbient);
      }
      else {
        add_lights (scene, hemiLight, lightAmbient);
      }
      // camera
      camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, 0.1, 1000);
      camera.rotation.y = start_rotation_player.y
      // loaders
      load_world(scene, camera, './nature.obj','./nature.mtl', start_position_player.x, start_position_player.y, start_position_player.z);
      load_object_gltf(scene, name_gun,false,'./gun.gltf',0,4,-15,0,45,0);
      load_object_gltf(scene, name_enemy,false,'./woodsman.gltf',0,0,-15,0,90,0);
      load_object_gltf(scene, name_enemy_2,false,'./woodsman2.gltf',0,0,30,0,90,0);
      // audio
      soundGameOver = load_audio(camera, '../sounds/game_over.wav')
      soundArmy = load_audio(camera, '../sounds/shoot.wav')
      // crossair
      crosshair = add_crosshair(crosshair, camera, collisionDistance, crossColorReady, 0.08, 0.08);
      // controller
      controller();
    }
    // set how the camera should move according to user's command
    function motion(){
      if ( controls.isLocked === true ) {
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta;
        direction.z = collisions['front']*Number( movements[0] ) - collisions['back']*Number( movements[1] );
        direction.x = collisions['right']*Number( movements[3] ) - collisions['left']*Number( movements[2] );
        direction.normalize();
        if ( movements[0] || movements[1] ) velocity.z -= direction.z * 500.0 * delta;
        if ( movements[2] || movements[3] ) velocity.x -= direction.x * 100.0 * delta;
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
    // animation
    var animate = function () {
      requestAnimationFrame( animate );
      motion();
      if(scene.getObjectByName('world') && scene.getObjectByName(name_enemy) && scene.getObjectByName(name_gun) &&
      loaded_1 && loaded_2) $(".loader").fadeOut("slow");
      if((camera.position.x >= 72.50) && (camera.position.z <= -88.28) && died_enemy && died_enemy_2) {
        window.location.href = '../base_castle/index_castle.html?light=' + get_light+ '&sex='+get_sex;
        $(".loader").fadeIn("slow");
      }
      loading_first_enemy()
      loading_second_enemy()
      check_collisions(controls, camera, scene, collisions, collisionDistance);
      weapon_movement(scene,camera,name_gun, 0.6, -0.3, -3);
      shooting();
      update_health_bar();

      renderer.render(scene, camera);

    }
    // load body part of first enemy
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
        if(LegDx) tween_leg.up.dx = {position:new createjs.Tween.get(LegDx.position),rotation:new createjs.Tween.get(LegDx.rotation)};
        if(LegSx) tween_leg.up.sx = {position:new createjs.Tween.get(LegSx.position),rotation:new createjs.Tween.get(LegSx.rotation)};
        if(LegSx_Down) tween_leg.down.dx = {position:new createjs.Tween.get(LegDx_Down.position),rotation:new createjs.Tween.get(LegDx_Down.rotation)};
        if(LegDx_Down) tween_leg.down.sx = {position:new createjs.Tween.get(LegSx_Down.position),rotation:new createjs.Tween.get(LegSx_Down.rotation)};
        if(Model && ArmDx && LegDx && LegSx && LegDx_Down && LegSx_Down)loaded_1 = true
      }
    }
    // load body part of second enemy
    function loading_second_enemy(){
      if(loaded_2) enemy_animation_2();
      if (scene.getObjectByName(name_enemy_2) && !loaded_2) {
        Model_2 = scene.getObjectByName(name_enemy_2);
        ArmDx_2 = Model_2.getObjectByName('ArmDX2');
        if(Model_2 && ArmDx_2)loaded_2 = true
      }
    }
    // user shooting
    function shooting(){
      camera.getWorldDirection(worldDirection2);
      raycasterOrigin2 = new THREE.Vector3(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
      raycaster2.set(raycasterOrigin2, worldDirection2);
      intersect = raycaster2.intersectObjects( scene.children, true );
      if (typeof intersect[5] !== 'undefined') {
        if (movements[4] == true) {
          var temp = nowShot;
          nowShot = performance.now()
          if((nowShot-prevShot) >= time_shooting){
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
              soundArmy.play()
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
          bulletPosition.to({x:toPosX, y:toPosY, z:toPosZ}, time_shooting);
          if ((scene.getObjectByName(name_bullet).position.x == toPosX) &&
          (scene.getObjectByName(name_bullet).position.y == toPosY) &&
          (scene.getObjectByName(name_bullet).position.z == toPosZ)){
            if((intersect[5].object.name !== name_bullet) &&  (scene.getObjectByName(name_enemy)) &&
            (typeof (scene.getObjectByName(name_enemy)).getObjectByName(intersect[5].object.name) !== 'undefined')){
              // headshot
              if(intersect[5].object.name == 'Head' ||
              intersect[5].object.name == 'Hat' ||
              intersect[5].object.name == 'Lips' ||
              intersect[5].object.name == 'EyeDx' ||
              intersect[5].object.name == 'EyeSx' ||
              intersect[5].object.name == 'Hair'){
                enemyLifes -= 1,5*damage;
              }
              else enemyLifes -= damage;
              if(enemyLifes <= 0) {
                enemyLifes = 0
                scene.remove(scene.getObjectByName(name_enemy));
                scene.remove(scene.getObjectByName(name_bullet_enemy));
                died_enemy = true;
                canShotEnemy1 = false;
                enemies_dead();
              }
            }
            if((intersect[5].object.name !== name_bullet) &&  (scene.getObjectByName(name_enemy_2)) &&
            (typeof (scene.getObjectByName(name_enemy_2)).getObjectByName(intersect[5].object.name) !== 'undefined')){
              // headshot
              if(intersect[5].object.name == 'Head2' ||
              intersect[5].object.name == 'Hat2' ||
              intersect[5].object.name == 'Lips2' ||
              intersect[5].object.name == 'EyeDx2' ||
              intersect[5].object.name == 'EyeSx2' ||
              intersect[5].object.name == 'Hair2'){
                enemyLifes2 -= 1.5*damage;
              }
              else enemyLifes2 -= damage;
              if(enemyLifes2 <= 0) {
                enemyLifes2 = 0
                scene.remove(scene.getObjectByName(name_enemy_2));
                scene.remove(scene.getObjectByName(name_bullet_enemy_2));
                died_enemy_2 = true;
                canShotEnemy2 = false;
                enemies_dead();
              }
            }
            scene.remove(scene.getObjectByName(name_bullet));
            bulletLoaded = false;
            crosshair.material = new THREE.LineBasicMaterial({ color: crossColorReady });
          }
        }
        }
      }
    // show on screen the health bar for enemies and user
    function update_health_bar(){
      // user
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
      healthBarCharacter.innerHTML = Math.round(characterLifes*10) +"%";
      // first enemy
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
      healthBarEnemy.innerHTML = Math.round(enemyLifes*10) +"%";
      // second enemy
      healthBarEnemy2 = document.getElementById("healthBarEnemy2");
      healthBarEnemy2.style.width = enemyLifes2*10 + "%";
      if(enemyLifes2 >= 8) {
        healthBarEnemy2.style.background = "green";
      }
      if(enemyLifes2 <= 3) {
        healthBarEnemy2.style.background = "red";
      }
      if (enemyLifes2 < 8 && enemyLifes2 > 3) {
        healthBarEnemy2.style.background = "orange";
      }
      healthBarEnemy2.innerHTML = Math.round(enemyLifes2*10) +"%";
    }
    // animation of first enemy
    function enemy_animation(){
      ArmDx.rotation.x = THREE.Math.degToRad(-70);
      ArmDx.rotation.z = THREE.Math.degToRad(180);
      ArmDx.position.x = -0.9;
      ArmDx.position.y = 0.4;
      ArmDx.position.z = 0.8;
      walk()
      if(scene.getObjectByName(name_enemy)) scene.getObjectByName(name_enemy).lookAt(camera.position);
      if(canShotEnemy1) time_shooting_rate += 1;
      if(time_shooting_rate / 56 == 1) {
        enemy_shooting_1 = true;
        time_shooting_rate = 0;
      }
      shot_enemy()
    }
    // animation of second enemy
    function enemy_animation_2(){
      ArmDx_2.rotation.x = THREE.Math.degToRad(-70);
      ArmDx_2.rotation.z = THREE.Math.degToRad(180);
      ArmDx_2.position.x = -0.9;
      ArmDx_2.position.y = 0.4;
      ArmDx_2.position.z = 0.8;
      if(scene.getObjectByName(name_enemy_2)) scene.getObjectByName(name_enemy_2).lookAt(camera.position);
      if(canShotEnemy2) time_shooting_rate2 += 1;
      if(time_shooting_rate2 / 82 == 1) {
        enemy_shooting_2 = true;
        time_shooting_rate2 = 0;
      }
      shot_enemy_2()
    }
    // walking function for the first enemy
    function walk(){
      var distance = 15;
      var degree = 4.4;
      var gait = 15000
      tween_leg.up.dx.rotation.to({x: THREE.Math.degToRad(-degree)},1000).to({x: THREE.Math.degToRad(degree)},1000);
      tween_leg.up.sx.rotation.to({x: THREE.Math.degToRad(degree)},1000).to({x: THREE.Math.degToRad(-degree)},1000);
      tween_leg.up.dx.position.to({z: -0.2},1000).to({z: 0.2},1000);
      tween_leg.up.sx.position.to({z: 0.2},1000).to({z: -0.2},1000);
      tween_torso.position.to({x:Model.initial_position.x - 2*distance,z:Model.initial_position.z + distance},gait).to({x:Model.initial_position.x + distance,z:Model.initial_position.z + distance},gait).to({x:Model.initial_position.x + distance,z:Model.initial_position.z - distance},gait).to({x:Model.initial_position.x,z:Model.initial_position.z},gait)
    }
    // first enemy shooting
    function shot_enemy(){
      var weaponModelEnemy = scene.getObjectByName(name_enemy);
      if (enemy_shooting_1 == true) {
          create_bullet(scene,name_bullet_enemy,0.02)
          // To move the gun together with the camera, but translated of the right position
          if (scene.getObjectByName(name_bullet_enemy)) {
            var bulletModelEnemy = scene.getObjectByName(name_bullet_enemy);
            if(weaponModelEnemy){
              bulletModelEnemy.position.copy( weaponModelEnemy.position);
              bulletModelEnemy.rotation.copy( weaponModelEnemy.rotation);
              bulletModelEnemy.translateX( -0.65);
              bulletModelEnemy.translateY( 2.85);
              bulletModelEnemy.translateZ( 2);
            }
          }
        enemy_shooting_1 = false;
      }
      if (bulletModelEnemy && !bulletLoadedEnemy) {
        bulletPositionEnemy = new createjs.Tween.get(bulletModelEnemy.position);
        toPosXEnemy = camera.position.x;
        toPosYEnemy = camera.position.y;
        toPosZEnemy = camera.position.z;
        bulletLoadedEnemy = true;
      }
      if (scene.getObjectByName(name_bullet_enemy) && bulletLoadedEnemy) {
        bulletPositionEnemy.to({x:toPosXEnemy, y:toPosYEnemy, z:toPosZEnemy}, time_shooting);
        if ((scene.getObjectByName(name_bullet_enemy).position.x == toPosXEnemy) &&
        (scene.getObjectByName(name_bullet_enemy).position.y == toPosYEnemy) &&
        (scene.getObjectByName(name_bullet_enemy).position.z == toPosZEnemy)){
          var range_camera = 0.8;
          if(camera.position.x >= toPosXEnemy - range_camera && camera.position.x <= toPosXEnemy + range_camera &&
            camera.position.y >= toPosYEnemy - range_camera && camera.position.y <= toPosYEnemy + range_camera &&
            camera.position.z >= toPosZEnemy - range_camera && camera.position.z <= toPosZEnemy + range_camera){
            characterLifes -= damage_enemy1;
            if(characterLifes <= 0) {
              characterLifes = 0;
              died = true;
              soundGameOver.play()
              window.setTimeout(function(){window.location.href = '../index.html';}, 1000);
              $(".loader").fadeIn("slow");
            }
          }
          scene.remove(scene.getObjectByName(name_bullet_enemy));
          bulletLoadedEnemy = false;
        }
      }
    }
    // second enemy shooting
    function shot_enemy_2(){
      var weaponModelEnemy2 = scene.getObjectByName(name_enemy_2);
      if (enemy_shooting_2 == true) {
          create_bullet(scene,name_bullet_enemy_2,0.02)
          // To move the gun together with the camera, but translated of the right position
          if (scene.getObjectByName(name_bullet_enemy_2)) {
            var bulletModelEnemy2 = scene.getObjectByName(name_bullet_enemy_2);
            if(weaponModelEnemy2){
              bulletModelEnemy2.position.copy( weaponModelEnemy2.position);
              bulletModelEnemy2.rotation.copy( weaponModelEnemy2.rotation);
              bulletModelEnemy2.translateX( -0.65);
              bulletModelEnemy2.translateY( 2.85);
              bulletModelEnemy2.translateZ( 2);
            }
          }
        enemy_shooting_2 = false;
      }
      if (bulletModelEnemy2 && !bulletLoadedEnemy2) {
        bulletPositionEnemy2 = new createjs.Tween.get(bulletModelEnemy2.position);
        toPosXEnemy2 = camera.position.x;
        toPosYEnemy2 = camera.position.y;
        toPosZEnemy2 = camera.position.z;
        bulletLoadedEnemy2 = true;
      }
      if (scene.getObjectByName(name_bullet_enemy_2) && bulletLoadedEnemy2) {
        bulletPositionEnemy2.to({x:toPosXEnemy2, y:toPosYEnemy2, z:toPosZEnemy2}, time_shooting);
        if ((scene.getObjectByName(name_bullet_enemy_2).position.x == toPosXEnemy2) &&
        (scene.getObjectByName(name_bullet_enemy_2).position.y == toPosYEnemy2) &&
        (scene.getObjectByName(name_bullet_enemy_2).position.z == toPosZEnemy2)){
          var range_camera = 0.8;
          if(camera.position.x >= toPosXEnemy2 - range_camera && camera.position.x <= toPosXEnemy2 + range_camera &&
            camera.position.y >= toPosYEnemy2 - range_camera && camera.position.y <= toPosYEnemy2 + range_camera &&
            camera.position.z >= toPosZEnemy2 - range_camera && camera.position.z <= toPosZEnemy2 + range_camera){
            characterLifes -= damage_enemy2;
            if(characterLifes <= 0) {
              characterLifes == 0;
              died = true;
              soundGameOver.play()
              window.setTimeout(function(){window.location.href = '../index.html';}, 1000);
              $(".loader").fadeIn("slow");
            }
          }
          scene.remove(scene.getObjectByName(name_bullet_enemy_2));
          bulletLoadedEnemy2 = false;
        }
      }
    }
    // if both enemy are dead them the portal is enabled and the user can go to the next level
    function enemies_dead(){
      if(died_enemy_2 && died_enemy){
        canShotEnemy1 = false
        canShotEnemy2 = false
        delete_lights(scene, dirLight, lightAmbient);
        if (get_light == 'night') {
          scene.add(hemiLight);
        }
        // Add spotlight
        load_object_gltf(scene, 'spot', false, './spotlight.gltf', 76, 20,-97, 0, -90, 0);
      }
    }
    // start scene and animation
    init();
    animate();
