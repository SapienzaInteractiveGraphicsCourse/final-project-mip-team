worldDirection2    //Import library and loaders easiest way: link to unpkg website
    import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
    import { PointerLockControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/PointerLockControls.js';
    import {onKeyUp, onKeyDown, load_world_gltf, load_object_gltf, weapon_movement, check_collisions, add_crosshair, delete_lights, add_lights} from '../common_functions.js';


    var renderer, scene, controls, camera;
    var objects = [];
    var raycaster;

    var movements = [false,false,false,false,false];

    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();

    var dragonModel;
    var alreadyLoaded = false;
    var dragonTweens = [];

    var collisions = [];
    collisions['front'] = 1;
    collisions['back'] = 1;
    collisions['left'] = 1;
    collisions['right'] = 1;
    var collisionDistance = 10;

    var arrowPosition;
    var arrowLoaded = false;
    var toPosX, toPosY, toPosZ;
    var worldDirection2 = new THREE.Vector3();
    var intersect, rayCasterOrigin2;
    var raycaster2 = new THREE.Raycaster();

    var crosshair;
    var crossColorReady = 0xAAFFAA;
    var crossColorWait = 0xC9302C;

    var healthBarCharacter, healthBarEnemy;
    var characterLifes = 10;
    var enemyLifes = 10;

    var dirLight, hemiLight, lightAmbient;

    function controller(){
      controls = new PointerLockControls( camera, document.body );

        var blocker = document.getElementById( 'blocker' );
        var instructions = document.getElementById( 'instructions' );

        instructions.addEventListener( 'click', function () {

          controls.lock();

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

        // Collisions[x] is 0 when that direction is forbidden, otherwise it's 1 and all works fine
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
        controls.getObject().position.y += ( velocity.y * delta );

        if ( controls.getObject().position.y < 10 ) {
          velocity.y = 0;
          controls.getObject().position.y = -17;
          movements[4] = true;
        }
        prevTime = time;

      }
    }


    function init(){
      //Create the renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      // Colors are less dark and more similar to the reality
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

      /*
      dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 );
      scene.add( dirLightHeper );
      */

      hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
      hemiLight.color.setHSL( 0.6, 1, 0.6 );
      scene.add( hemiLight );

      lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
      scene.add( lightAmbient );
      /* */

      //Camera
      camera = new THREE.PerspectiveCamera(35,
        window.innerWidth/window.innerHeight, 0.1, 1000);

      //Load environment: the y position should coincide with controls.getObject().position.y
      load_world_gltf(scene, camera, 'world/source/tutorial_castle_town.gltf',-10,-17,50);
      //Load other objects
      load_object_gltf(scene, 'dragon', false, 'dragon/dragon.gltf', -8, 18, -60, 20, 0, 0);
      load_object_gltf(scene, 'crossbow', false, 'crossbow/crossbow.gltf', 0, 0, 0, 0, 0, 0);
      load_object_gltf(scene, 'fire_ball', false, 'fire_ball/fire_ball.gltf', -8, 10, -30, 20, 0, 0);


      crosshair = add_crosshair(crosshair, camera, collisionDistance, crossColorReady);

      controller();
    }

  	/* fine */

    //Animation
    var animate = function () {
      requestAnimationFrame( animate );

      // Check if the object 'dragon' is loaded
      if (scene.getObjectByName('dragon') && alreadyLoaded == false) {
        alreadyLoaded = true;
        var dragonModel = scene.getObjectByName('dragon');

        //Create a tween objects
        dragonTweens['wing_left_joint_rotation'] = new createjs.Tween.get(dragonModel.getObjectByName('wing_left_joint').rotation);
        dragonTweens['wing_right_joint_rotation'] = new createjs.Tween.get(dragonModel.getObjectByName('wing_right_joint').rotation);
        dragonTweens['torso_position'] = new createjs.Tween.get(dragonModel.getObjectByName('torso').position);
      }

      // If the model is loaded, the tween is created too and we can use it
      if (alreadyLoaded == true) {
        // Animate the tween z axis for 2s (2K ms) and when it's done, do the same in the opposite direction.
        dragonTweens['wing_left_joint_rotation'].to({y: THREE.Math.degToRad(12)}, 2000).to({y: THREE.Math.degToRad(-12)}, 2000);
        dragonTweens['wing_right_joint_rotation'].to({y: THREE.Math.degToRad(-12)}, 2000).to({y: THREE.Math.degToRad(12)}, 2000);
        // Meanwhile, move the torso in the y direction
        dragonTweens['torso_position'].to({y: 2.5}, 2000).to({y: -2.5}, 2000);
      }

      motion();
      weapon_movement(scene, camera, 'crossbow', 0.2, -0.3, -2);

      // Inizio animazione proiettile (se si clicca x)
    	camera.getWorldDirection(worldDirection2);
    	rayCasterOrigin2 = new THREE.Vector3(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
    	raycaster2.set(rayCasterOrigin2, worldDirection2);
    	intersect = raycaster2.intersectObjects( scene.children, true );

      if (typeof intersect[4] !== 'undefined') {
    		if (movements[5] == true) {
    			load_object_gltf(scene, 'arrow', false, 'arrow/arrow.gltf', 0, 0, 0, 0, 0, 0);
          // To move the crossbow together with the camera, but translated of the right position
    			if (scene.getObjectByName('arrow')) {
    				var arrowModel = scene.getObjectByName('arrow');
    				var weaponModel = scene.getObjectByName('crossbow');
    				arrowModel.position.copy( weaponModel.position );
    				arrowModel.rotation.copy( weaponModel.rotation );
    				arrowModel.translateX( 0 );
    				arrowModel.translateY( 0 );
    				arrowModel.translateZ( 0 );
    			}
    			movements[5] = false;
    		}
    		if (arrowModel && !arrowLoaded) {
    			arrowPosition = new createjs.Tween.get(arrowModel.position);
    			toPosX = intersect[4].point.x;
    			toPosY = intersect[4].point.y;
    			toPosZ = intersect[4].point.z;
    			arrowLoaded = true;
    		}
    		if (scene.getObjectByName('arrow') && arrowLoaded) {
          crosshair.material = new THREE.LineBasicMaterial({ color: crossColorWait });
    			arrowPosition.to({x:toPosX, y:toPosY, z:toPosZ}, 3000);
    			if ((scene.getObjectByName('arrow').position.x == toPosX) &&
    			(scene.getObjectByName('arrow').position.y == toPosY) &&
    			(scene.getObjectByName('arrow').position.z == toPosZ)){
            console.log(intersect[4].object.name);
    				if((intersect[4].object.name !== 'bolt_low') &&
    				(typeof (scene.getObjectByName('dragon')).getObjectByName(intersect[4].object.name) !== 'undefined')){
    					//console.log(scene.getObjectByName('dragon').getObjectByName(intersect[0].object.name));
    					//scene.remove(scene.getObjectByName('dragon'));
    					console.log('Preso');
              enemyLifes -= 1;
              if(enemyLifes == 0) {
                scene.remove(scene.getObjectByName('dragon'));
                scene.remove(scene.getObjectByName('fire_ball'));
                console.log('Morto');
              }
    				}
    				scene.remove(scene.getObjectByName('arrow'));
            crosshair.material = new THREE.LineBasicMaterial({ color: crossColorReady });
    				arrowLoaded = false;
    			}
    		}
    	}
    	// fine animazione proiettile

      // Vite
    	/*
    	healthBarCharacter = document.getElementById("healthBarCharacter");
    	healthBarCharacter.style.width = "20%";
    	healthBarCharacter.style.background = "green";
    	healthBarCharacter.innerHTML ="20%";
    	*/

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
    	// fine vite


      check_collisions(controls, camera, scene, collisions, collisionDistance);
      renderer.render(scene, camera);
    }
    init();
    animate();
