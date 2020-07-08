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