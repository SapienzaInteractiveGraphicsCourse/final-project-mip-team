
import { OBJLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.118.3/examples/jsm/loaders/MTLLoader.js';

//secondo me questa ormai si può togliere
export function move(camera,keyName){
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
  }
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