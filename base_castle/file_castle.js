

    //Import library and loaders easiest way: link to unpkg website
    import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
    import { GLTFLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';

    //Create the renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //Create the scene
    const scene = new THREE.Scene();

    //costante per identificare il mondo attualmente visto
    var world_loaded = 1;

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

    /*
		dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 );
		scene.add( dirLightHeper );
    */

    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6, 1, 0.6 );
    scene.add( hemiLight );

    var lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( lightAmbient );
    /* */

    //Camera
    const camera = new THREE.PerspectiveCamera(35,
      window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    camera.position.x = -10;
    camera.position.y = 3;

    //Loaders
    load_world('blender-files/source/tutorial_castle_town.gltf',-10,3,50);
    // funzione per fare il load del mondo
    function load_world(path_gltf_world, start_position_x, start_position_y, start_position_z){
        var loader = new GLTFLoader();
        camera.position.x = start_position_x;
        camera.position.y = start_position_y;
        camera.position.z = start_position_z;
        loader.load( path_gltf_world, function ( gltf ) {

            scene.add( gltf.scene );

        }, undefined, function ( error ) {

            console.error( error );

        } );
    }
    /*
    Qui va messo il loader per obj e mlt, se necessario.
    */




    /* Codice per spostarsi cliccando tasti sulla tastiera */
  	document.addEventListener('keypress', (event) => {
  	  const keyName = event.key;

  	  if (keyName === 'Control') {
  		// do not alert when only Control key is pressed.
  		return;
  	  }
  	  if (keyName == 'w') {
  		camera.position.z -= 1;
  	  }
  	  if (keyName == 's') {
  		camera.position.z += 1;
  	  }
  	  if (keyName == 'a') {
  		camera.position.x -= 1;
  	  }
  	  if (keyName == 'd') {
  		camera.position.x += 1;
  	  }
  	  if (keyName == 'e') {
  		camera.position.y += 1;
  	  }
  	  if (keyName == 'r') {
  		camera.position.y -= 1;
  	  }
  	  if (keyName == 'z') {
  		camera.rotation.y += 0.1;
  	  }
  	  if (keyName == 'x') {
  		camera.rotation.y -= 0.1;
  	  }
      }, false);
      
/*
      document.getElementById("change").onclick = function (event) {
        //scene.remove(world.scene)
        if(world_loaded < 3) world_loaded += 1;
        //questo andrà tolto dopo il terzo il giocatore vince
        else world_loaded = 1;
        if(world_loaded == 1){
            world = load_world('blender-files/source/tutorial_castle_town.gltf',-1,3,50);
        }
        if(world_loaded == 2){
            world = load_world('blender-files/source/nature_world.gltf',10,22,50);
        }
        if(world_loaded == 3){
            world = load_world('blender-files/source/tutorial_castle_town.gltf',-10,3,50);
        }
    };*/

    function change_world(position_portal_x,position_portal_y, position_portal_z){
        if (camera.position.x == position_portal_x && camera.position.y == position_portal_y && camera.position.z == position_portal_z){
          //mettere schermata vittoria
          window.location.replace("../base_nature/index_nature.html");
        }
    }
  	/* fine */

    //Animation
    var animate = function () {
      requestAnimationFrame( animate );
      renderer.render(scene, camera);
      change_world(-1,3,5)
    }
    animate();