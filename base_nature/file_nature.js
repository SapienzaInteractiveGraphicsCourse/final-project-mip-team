    //Import library and loaders easiest way: link to unpkg website
    import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
    import { PointerLockControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/PointerLockControls.js';
    import {load_world, onKeyUp, onKeyDown, check_collisions, load_object_gltf, weapon_movement} from '../common_functions.js';

    var renderer, scene, camera, controls;
    var objects = [];
    var raycaster;

    var movements = [false,false,false,false,false];

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

    var name_gun = 'gun'

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
      load_object_gltf(scene, name_gun,true,'./gun.gltf',0,4,-15,0,45,0);
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
    //Animation
    var animate = function () {
      requestAnimationFrame( animate );
      motion();
      check_collisions(controls, camera, scene, collisions, collisionDistance);
      weapon_movement(scene,camera,name_gun,0.6, -0.3, -3);
      console.log(scene.getObjectByName(name_gun).position)
      renderer.render(scene, camera);
      
    }
    init();
    animate();