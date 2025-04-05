import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPostProcessing } from './composer.js'
import * as character from "./character.js"
import { createGround } from './ground.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 8);
camera.lookAt(new THREE.Vector3(0, 1, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.classList.add('three-scene')

const { composer, pixelPass } = setupPostProcessing(renderer, scene, camera);
scene.background = null

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.minDistance = 4;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 4;   // 45 degrees
controls.maxPolarAngle = Math.PI / 2;   // 90 degrees
controls.zoomSpeed = 5; // Default is 1. Lower = slower, higher = faster
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 10, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const chars = []
const charMixers = []

character.loadModel(scene, chars, charMixers)
createGround(scene)

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(chars[0], true);

  if (intersects.length > 0) {
    character.playCharAnimation(charMixers, 0, "Sword Slash");
  } else {
    character.playCharAnimation(charMixers, 0, "Sword Idle");
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate)

  character.aiTurn(chars)

  const delta = clock.getDelta()
  charMixers.forEach(m => m.update(delta))
  controls.update()
  //renderer.render(scene, camera)
  composer.render()
}

animate();

const hudInfo = document.getElementById('hud-info')
let chant = ""

function spellChant(word) {
  chant += word

  if (chant === "*?~") console.log("Hold Spell")
  else if (chant === "~?~") console.log("Shield")
  else if (chant === "*#*") console.log("Fireball")

  if (chant.length >= 3) chant = ""

  hudInfo.innerText = chant
}

window.spellChant = spellChant

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  pixelPass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});
