import * as THREE from 'three';
import textureUrl from './assets/shadow.png';

let shadowMesh;

function createShadow(scene) {
  const textureLoader = new THREE.TextureLoader();

  // Load texture and alpha map
  const texture = textureLoader.load(textureUrl);

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  const geometry = new THREE.PlaneGeometry(1.0, 1.0);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    opacity: 0.4,
    transparent: true,
    depthWrite: false,
    //side: THREE.DoubleSide
  });

  shadowMesh = new THREE.Mesh(geometry, material);
  shadowMesh.rotation.x = -Math.PI / 2;  // Make it horizontal
  shadowMesh.receiveShadow = true;

  scene.add(shadowMesh);
}

export { createShadow };
