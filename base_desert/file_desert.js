//Import library and loaders easiest way: link to unpkg website
import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/PointerLockControls.js';
import {load_world_gltf, onKeyUp, onKeyDown, load_object_gltf, weapon_movement, check_collisions, delete_lights, add_lights, add_crosshair} from '../common_functions.js';

var renderer, scene, camera, controls;
var objects = [];
var raycaster;

var movements = [false,false,false,false,false,false];

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

var cowboyModel;
var alreadyLoaded = false;
var cowboyTweens = [];
var bulletPosition;
var bulletLoaded = false;
var toPosX, toPosY, toPosZ;
var worldDirection2 = new THREE.Vector3();
var intersect, raycasterOrigin2;
var raycaster2 = new THREE.Raycaster();

var collisions = [];
collisions['front'] = 1;
collisions['back'] = 1;
collisions['left'] = 1;
collisions['right'] = 1;
var collisionDistance = 0.4;

var healthBarCharacter, healthBarEnemy;
var died = false;
var characterLifes = 10;
var enemyLifes = 10;

var lightOnOff = false;
var dirLight, hemiLight, lightAmbient;

var crosshair;
var crossColorReady = 0xAAFFAA;
var crossColorWait = 0xC9302C;


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

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 20, 10 );
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

		if ( movements[0] || movements[1] ) velocity.z -= direction.z * 40.0 * delta; //400.0
		if ( movements[2] || movements[3] ) velocity.x -= direction.x * 40.0 * delta; //400.0

		if ( onObject === true ) {
		  velocity.y = Math.max( 0, velocity.y );
		  movements[4] = true;
		}

		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );
		controls.getObject().position.y += ( velocity.y * delta );

		if ( controls.getObject().position.y < 10 ) {
		  velocity.y = 0;
		  controls.getObject().position.y = 0.6; //10
		  movements[4] = true;
		}
		prevTime = time;
	}
}


function init(){
	//Create the renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//renderer.outputEncoding = THREE.GammaEncoding; //così è più pastellato
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	//Create the scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x74D7FF ); // sfondo per avere effetto cielo di giorno
	
	// Lights
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

	// Camera
	camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 1000);

	// Add desert
	load_world_gltf(scene, camera, './desert.gltf', -8, 0.6, 0);
	camera.rotation.y = -1.57;
	
	// Add enemy
	load_object_gltf(scene, 'cowboy', true, './enemy/cowboy.gltf', 0, 0.2, 0, 0, -90, 0);
	
	// Add gun
	load_object_gltf(scene, 'gun', false, './gun/gun.gltf', -7, 0.4, 0.4, 0, -90, 0);
	
	
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


// Animation
var animate = function () {
	requestAnimationFrame( animate );
	motion();
	
	// If enemy is died, redirect to the base nature when the camera passes the portail
	if(died && (camera.position.x >= 4) && (camera.position.z <= -3) && (camera.position.z >= -4)) {
		window.location.replace("/base_nature/index_nature.html");
	}

	weapon_movement(scene, camera, 'gun', 0.1, -0.03, -0.3);

	// Codice animazione cowboy
	// Check if the object 'cowboy' is loaded
	if (scene.getObjectByName('cowboy') && alreadyLoaded == false) {
		alreadyLoaded = true;
		var cowboyModel = scene.getObjectByName('cowboy');

		//Create tween objects
		cowboyTweens['spallaDX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('spallaDX').rotation);
		cowboyTweens['spallaSX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('spallaSX').rotation);
		
		cowboyTweens['petto_position'] = new createjs.Tween.get(cowboyModel.getObjectByName('petto').position);
		cowboyTweens['petto_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('petto').rotation);
		
		cowboyTweens['ancaDX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('ancaDX').rotation);
		cowboyTweens['ancaSX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('ancaSX').rotation);
		
		cowboyTweens['ginocchioDX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('ginocchioDX').rotation);
		cowboyTweens['ginocchioSX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('ginocchioSX').rotation);
		
		cowboyTweens['piedeDX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('piedeDX').rotation);
		cowboyTweens['piedeSX_rotation'] = new createjs.Tween.get(cowboyModel.getObjectByName('piedeSX').rotation);
	}
	
	// If the model is loaded, the tween is created too and we can use it
	if (alreadyLoaded == true) {
		// Animate the tween z axis for 1s (1K ms) and when it's done, do the same in the opposite direction.
		cowboyTweens['spallaDX_rotation'].to({x: THREE.Math.degToRad(20)}, 1000).to({x: THREE.Math.degToRad(-20)}, 1000);
		cowboyTweens['spallaSX_rotation'].to({x: THREE.Math.degToRad(-20)}, 1000).to({x: THREE.Math.degToRad(20)}, 1000);
		
		cowboyTweens['ancaDX_rotation'].to({x: THREE.Math.degToRad(-115)}, 1000).to({x: THREE.Math.degToRad(-80)}, 1000);
		cowboyTweens['ancaSX_rotation'].to({x: THREE.Math.degToRad(-80)}, 1000).to({x: THREE.Math.degToRad(-115)}, 1000);
		
		cowboyTweens['ginocchioDX_rotation'].to({x: THREE.Math.degToRad(0)}, 1000).to({x: THREE.Math.degToRad(30)}, 1000);
		cowboyTweens['ginocchioSX_rotation'].to({x: THREE.Math.degToRad(30)}, 1000).to({x: THREE.Math.degToRad(0)}, 1000);
		
		cowboyTweens['piedeDX_rotation'].to({x: THREE.Math.degToRad(10)}, 1000).to({x: THREE.Math.degToRad(-10)}, 1000);
		cowboyTweens['piedeSX_rotation'].to({x: THREE.Math.degToRad(-10)}, 1000).to({x: THREE.Math.degToRad(10)}, 1000);
		
		// Meanwhile, move the cowboy (petto is the root) in the x and z directions
		cowboyTweens['petto_position'].to({x:1.5, z: 2}, 12000).to({x: 1, z: 0}, 12000);//.to({x: -1.5, z: 1}, 12000).to({x: -1, z: -1}, 12000);
		cowboyTweens['petto_rotation'].to({y: THREE.Math.degToRad(2)}, 2000).to({y: THREE.Math.degToRad(-2)}, 2000);
	}
	// fine animazione cowboy
	

	// Inizio animazione proiettile (se si clicca x)
	camera.getWorldDirection(worldDirection2);
	raycasterOrigin2 = new THREE.Vector3(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
	raycaster2.set(raycasterOrigin2, worldDirection2);
	intersect = raycaster2.intersectObjects( scene.children, true );

	if (typeof intersect[4] !== 'undefined') {
		if (movements[5] == true) {
			load_object_gltf(scene, 'bullet', false, './gun/bullet.gltf', 0, 0, 0, 0, 0, 0);
			// To move the gun together with the camera, but translated of the right position
			if (scene.getObjectByName('bullet')) {
				var bulletModel = scene.getObjectByName('bullet');
				var weaponModel = scene.getObjectByName('gun');
				bulletModel.position.copy( weaponModel.position );
				bulletModel.rotation.copy( weaponModel.rotation );
				bulletModel.translateX( 0 );
				bulletModel.translateY( 0.028 );
				bulletModel.translateZ( -0.15 );
			}
			movements[5] = false;
		}
		if (bulletModel && !bulletLoaded) {
			bulletPosition = new createjs.Tween.get(bulletModel.position);
			toPosX = intersect[4].point.x;
			toPosY = intersect[4].point.y;
			toPosZ = intersect[4].point.z;
			bulletLoaded = true;
		}
		if (scene.getObjectByName('bullet') && bulletLoaded) {
			crosshair.material = new THREE.LineBasicMaterial({ color: crossColorWait });
			
			bulletPosition.to({x:toPosX, y:toPosY, z:toPosZ}, 1000);

			if ((scene.getObjectByName('bullet').position.x == toPosX) && 
			(scene.getObjectByName('bullet').position.y == toPosY) &&
			(scene.getObjectByName('bullet').position.z == toPosZ)){
				if((intersect[4].object.name !== 'Sphere001') &&  (scene.getObjectByName('cowboy')) &&
				(typeof (scene.getObjectByName('cowboy')).getObjectByName(intersect[4].object.name) !== 'undefined')){
					console.log('Preso');
					enemyLifes -= 1;
					if(enemyLifes == 0) {
						scene.remove(scene.getObjectByName('cowboy'));
						console.log('Morto');
						died = true;
						
						delete_lights(scene, dirLight, lightAmbient);
						if (lightOnOff) {
							scene.add(hemiLight);
						}
						// Add spotlight
						load_object_gltf(scene, 'spot', false, './spotlight/spotlight.gltf', 4, 8, -4, 0, -90, 0);
					}
				}
				scene.remove(scene.getObjectByName('bullet'));
				crosshair.material = new THREE.LineBasicMaterial({ color: crossColorReady });
				bulletLoaded = false;
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