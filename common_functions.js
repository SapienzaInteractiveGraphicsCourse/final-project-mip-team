import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js';
import { OBJLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';


// funzione da rivedere
export function change_world(position_portal_x,position_portal_y, position_portal_z){
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
        scene.add(object);
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
    objModel.rotation.x = THREE.Math.degToRad(start_rotation_x);
    objModel.rotation.y = THREE.Math.degToRad(start_rotation_y);
    objModel.rotation.z = THREE.Math.degToRad(start_rotation_z);
    }, onProgress, onError);

}

export function delete_lights(scene,directional,ambient){
  scene.remove(directional);
  scene.remove(ambient);
  scene.background = new THREE.Color( 0x175082 );
}

export function add_lights(scene,directional,ambient,spotlight = null){
  scene.add( directional);
  scene.add( ambient );
  scene.remove(spotlight);
  scene.background = new THREE.Color( 0x74D7FF );
}



export function onKeyDown(event,movements,velocity) {
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
    case 32: // space
      if ( movements[4] === true ) velocity.y += 180;
      movements[4] = false;
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