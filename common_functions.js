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

  export function load_world(scene, camera, objects,path_obj_world, path_mtl_world, start_position_x, start_position_y, start_position_z){
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
          objects.push(object);
          scene.add(object);
        });
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

      export function load_object_gltf(scene, camera, path_gltf_object,
                                      start_position_x, start_position_y, start_position_z,
                                      start_rotation_x, start_rotation_y, start_rotation_z){
        var loader = new GLTFLoader();
        loader.load( path_gltf_object, function ( gltf ) {
          var dragonModel = gltf.scene;
          scene.add( dragonModel );

          dragonModel.position.x = start_position_x;
          dragonModel.position.y = start_position_y;
          dragonModel.position.z = start_position_z;
          dragonModel.rotation.x = THREE.Math.degToRad(start_rotation_x);
          dragonModel.rotation.y = THREE.Math.degToRad(start_rotation_y);
          dragonModel.rotation.z = THREE.Math.degToRad(start_rotation_z);

          }, undefined, function ( error ) {

              console.error( error );

          } );

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
