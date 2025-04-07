import * as THREE from 'three';
import groundTextureUrl from './assets/dirt.png';
import groundAlphaUrl from './assets/path-alpha.png';

let groundMesh;

function createGround(scene) {
  const textureLoader = new THREE.TextureLoader();

  // Load texture and alpha map
  const texture = textureLoader.load(groundTextureUrl);
  const alphaMap = textureLoader.load(groundAlphaUrl);

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  alphaMap.wrapS = alphaMap.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 3)
  //texture.needsUpdate = true
  alphaMap.repeat.set(1, 3)
  //alphaMap.needsUpdate = true

  const geometry = new THREE.PlaneGeometry(10, 30);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    alphaMap: alphaMap,
    transparent: true,         // Needed for alphaMap to work
    depthWrite: false,         // Optional: helps with transparency rendering
    side: THREE.DoubleSide     // Show both sides of the plane if needed
  });

  groundMesh = new THREE.Mesh(geometry, material);
  groundMesh.rotation.x = -Math.PI / 2;  // Make it horizontal
  groundMesh.position.z = -9
  groundMesh.receiveShadow = true;
  groundMesh.name = "ground"

  scene.add(groundMesh);

  return groundMesh
}

export { createGround };
