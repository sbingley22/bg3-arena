import * as THREE from 'three';

let sphereMesh;

function createSphere(scene) {
  const geometry = new THREE.SphereGeometry(1.0, 8, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0x114499,
    opacity: 0.0,
    transparent: true,
    depthWrite: false,
  });

  sphereMesh = new THREE.Mesh(geometry, material);
  sphereMesh.position.y = 1
  sphereMesh.name = "Sphere"

  scene.add(sphereMesh);
}

export { createSphere };
