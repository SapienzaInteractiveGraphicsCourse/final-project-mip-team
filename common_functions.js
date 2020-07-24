import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
import { OBJLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';


// funzione da rivedere
export function change_world(camera, position_portal_x,position_portal_y, position_portal_z){
  if (camera.position.x == position_portal_x && camera.position.y == position_portal_y && camera.position.z == position_portal_z){
    window.location.replace("../base_castle/index_castle.html");
  }
}

export function load_world(scene, camera, path_obj_world, path_mtl_world, start_position_x, start_position_y, start_position_z){
  var loader = new OBJLoader();
  var mtlLoader = new MTLLoader();
  camera.position.x = start_position_x;
  camera.position.y = start_position_y;
  camera.position.z = start_position_z;
  new Promise((resolve) => {
      mtlLoader.load(path_mtl_world, (materials) => {
        resolve(materials);
      });
    })
    .then((materials) => {
      materials.preload();
      loader.setMaterials(materials);
      loader.load(path_obj_world, (object) => {
        var obj = object
        obj.name = "world"
        scene.add(obj);
      },onProgress,onError);
    });
}

// funzione per fare il load del mondo
export function load_world_gltf(scene, camera, path_gltf_world, start_position_x, start_position_y, start_position_z){
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

export function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

export function load_object_gltf(scene, name, print_tree, path_gltf_object,
                                start_position_x, start_position_y, start_position_z,
                                start_rotation_x, start_rotation_y, start_rotation_z){
  var loader = new GLTFLoader();
  loader.load( path_gltf_object, function ( gltf ) {
    var objModel = gltf.scene;
    scene.add( objModel );
    objModel.name = name;
    // Print the tree of the model, if needed
    if (print_tree){
      console.log(dumpObject(objModel).join('\n'));
    }
    objModel.position.x = start_position_x;
    objModel.position.y = start_position_y;
    objModel.position.z = start_position_z;
    objModel.initial_position = {x:start_position_x,y:start_position_y,z:start_position_z}
    objModel.initial_rotation = {x:THREE.Math.degToRad(start_rotation_x),y:THREE.Math.degToRad(start_rotation_y),z:THREE.Math.degToRad(start_rotation_z)}
    objModel.rotation.x = THREE.Math.degToRad(start_rotation_x);
    objModel.rotation.y = THREE.Math.degToRad(start_rotation_y);
    objModel.rotation.z = THREE.Math.degToRad(start_rotation_z);
    }, onProgress, onError);

}

export function delete_lights(scene, light1, light2){
  scene.remove(light1);
  scene.remove(light2);
  scene.background = new THREE.Color( 0x175082 );
}

export function add_lights(scene, light1, light2){
  scene.add( light1 );
  scene.add( light2 );
  scene.background = new THREE.Color( 0x74D7FF );
}

export function onKeyDown(event,movements) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      movements[0] = true;
      break;
    case 37: // left
    case 65: // a
      movements[2] = true;
      break;
    case 40: // down
    case 83: // s
      movements[1] = true;
      break;
    case 39: // right
    case 68: // d
      movements[3] = true;
      break;
    case 88: // x
      movements[4] = true;
      break;
  }
}

export function onKeyUp( event, movements ) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      movements[0] = false;
      break;
    case 37: // left
    case 65: // a
      movements[2] = false;
      break;
    case 40: // down
    case 83: // s
      movements[1] = false;
      break;
    case 39: // right
    case 68: // d
      movements[3] = false;
      break;
	case 88: // x
	  movements[4] = false;
	  break;
  }
};

var onProgress = function (xhr) {
  if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
  }
};
var onError = function (xhr) { };

export function weapon_movement(scene, camera, name, pos_x, pos_y, pos_z) {
	// To move the gun together with the camera, but translated of the right position
	if (scene.getObjectByName(name)) {
		var weaponModel = scene.getObjectByName(name);
		weaponModel.position.copy( camera.position );
		weaponModel.rotation.copy( camera.rotation );
		weaponModel.translateX( pos_x );
		weaponModel.translateY( pos_y );
		weaponModel.translateZ( pos_z );
	}
}

export function check_collisions(controls, camera, scene, collisions, collisionDistance){
  // Initialize 4 raycasters, one for each direction of the y-plane
  var raycasters = [];
  raycasters['front'] = new THREE.Raycaster();
  raycasters['back'] = new THREE.Raycaster();
  raycasters['left'] = new THREE.Raycaster();
  raycasters['right'] = new THREE.Raycaster();

  // Set the origin of the raycasters at the camera position
  var raycasterOrigin = new THREE.Vector3(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z);

  // Define the direction of the camera (this is equal to the front raycaster direction)
  var worldDirection = new THREE.Vector3();
  camera.getWorldDirection(worldDirection);

  // Array containing intersection elements from all the raycasters
  var intersects = [];

  // Front collisions
  raycasters['front'].set(raycasterOrigin, worldDirection);
  intersects['front'] = raycasters['front'].intersectObjects( scene.children, true );
  // Back collisions
  raycasters['back'].set(raycasterOrigin, new THREE.Vector3(worldDirection.x, worldDirection.y, -1*worldDirection.z));
  intersects['back'] = raycasters['back'].intersectObjects( scene.children, true );
  // Right collisions, the direction is computed from the front direction:
  // perpendicular clockwise: https://gamedev.stackexchange.com/questions/70075/how-can-i-find-the-perpendicular-to-a-2d-vector
  raycasters['right'].set(raycasterOrigin, new THREE.Vector3(-worldDirection.z, worldDirection.y, worldDirection.x));
  intersects['right'] = raycasters['right'].intersectObjects( scene.children, true );
  // Left collisions, the direction is computed from the front direction:
  // Perpendicular counter-clockwise
  raycasters['left'].set(raycasterOrigin, new THREE.Vector3(worldDirection.z, worldDirection.y, -worldDirection.x));
  intersects['left'] = raycasters['left'].intersectObjects( scene.children, true );

  // For each intersections (front, back, right, left)
  for (var key in intersects){
    // For each element that intersect the raycaster
    for (var i = 0; i < intersects[key].length; i++){
      // Take the first element in the list that is close to the collision distance
      if (intersects[key][i].distance < collisionDistance) {
        collisions[key] = 0;
        break;
      }
      // If the distance becomes larger and before and before it was a collision, unlock that direction
      else if (intersects[key][i].distance >= collisionDistance && collisions[key] == 0) {
        collisions[key] = 1;
        break;
      }
    }
  }
}

export function add_crosshair (crosshair, camera, collisionDistance, colorReady, sizeX, sizeY) {
  var crossMaterial = new THREE.LineBasicMaterial({ color: colorReady });


  var crossGeometry = new THREE.Geometry();

  // crosshair
  crossGeometry.vertices.push(new THREE.Vector3(0, sizeY, 0));
  crossGeometry.vertices.push(new THREE.Vector3(0, -sizeY, 0));
  crossGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
  crossGeometry.vertices.push(new THREE.Vector3(sizeX, 0, 0));
  crossGeometry.vertices.push(new THREE.Vector3(-sizeX, 0, 0));

  crosshair = new THREE.Line(crossGeometry, crossMaterial);

  // Where to put the crosshair (center)
  var crosshairX = (50 / 100) * 2 -1;
  var crosshairY = (50 / 100) * 2 -1;

  crosshair.position.x = crosshairX * camera.aspect;
  crosshair.position.y = crosshairY;
  crosshair.position.z = -(collisionDistance+1);

  crosshair.name = "crosshair";
  camera.add( crosshair );

  return crosshair;
}

export function create_bullet(scene,name_bullet,radius = null){
  if(!radius)var geometry = new THREE.SphereGeometry(0.08, 10, 10);
  else var geometry = new THREE.SphereGeometry(radius, 10, 10);
  var material = new THREE.MeshLambertMaterial({color: 0x696969});
  var sphere = new THREE.Mesh(geometry, material);
  sphere.name = name_bullet
  scene.add(sphere);
}
export function load_audio (camera, path_audio) {
  // create an AudioListener and add it to the camera
  var listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  var sound = new THREE.Audio( listener );

  // load a sound and set it as the Audio object's buffer
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load( path_audio, function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( false );
    sound.setVolume( 0.5 );
    //sound.play();
  });
  return sound;
}
