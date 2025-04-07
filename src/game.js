import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPostProcessing } from './composer.js'
import * as character from "./character.js"
import { createGround } from './ground.js';
import { createBackground } from './background.js'

let scene;
let renderer;
let animationFrameId;

function runGame(level = 1) {
  const width = document.body.clientWidth // window.innerWidth
  const height = document.body.clientHeight // window.innerHeight
  scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 7, 8);
  camera.lookAt(new THREE.Vector3(0, 1, 0));

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement);
  renderer.domElement.classList.add('three-scene')
  renderer.domElement.id = "three-game"

  const { composer, pixelPass } = setupPostProcessing(renderer, scene, camera);
  scene.background = null

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.minDistance = 5;
  controls.maxDistance = 8;
  controls.minPolarAngle = Math.PI / 4;   // 45 degrees
  controls.maxPolarAngle = Math.PI / 2;   // 90 degrees
  controls.zoomSpeed = 5; // Default is 1. Lower = slower, higher = faster
  controls.enablePan = false
  controls.update();

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(5, 10, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  const chars = []
  const charMixers = []

  character.loadModel(scene, chars, charMixers)
  const ground = createGround(scene)
  createBackground(scene, "trees.png", [8,10,-10], [0,-Math.PI/2,0], [30,30], [3,1], [0.4,0.4,0.4])
  createBackground(scene, "trees.png", [-8,10,-10], [0,Math.PI/2,0], [30,30], [3,1], [0.4,0.4,0.4])
  createBackground(scene, "trees.png", [0,10,-28], [0,0,0], [30,30], [3,1], [0.4,0.4,0.4])

  // Raycaster for detecting clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let lastLMBClickTime = 0;

  window.addEventListener('mouseup', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (event.button === 2) {
      chant = ""
      hudInfo.innerText = chant
      return
    }

    const currentTime = performance.now()
    const clickTime = currentTime - lastLMBClickTime
    if (clickTime > 200) return

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground, true);

    if (intersects.length > 0) {
      chars[0].userData.destination = intersects[0].point
    } else {
      chars[0].userData.destination = null
    }
  })

  window.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return
    const currentTime = performance.now()
    lastLMBClickTime = currentTime
  })

  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate)
    const delta = clock.getDelta()

    character.playerUpdate(chars, charMixers, spellFlag, delta)
    character.aiTurn(chars, charMixers, delta)
    updateGame()

    charMixers.forEach(m => m.update(delta))
    camFollowPlayer()
    controls.update()
    //renderer.render(scene, camera)
    composer.render()
  }

  const hudInfo = document.getElementById('hud-info')
  let chant = ""
  let spellShield = -1
  let spellFlag = null

  function updateGame() {
    spellFlag = null

    if (spellShield > 0) {
      spellShield -= 1
    }
    if (spellShield === 0) {
      spellShield = -99
      spellFlag = "shield off"
    }
  }

  function spellChant(word) {
    if (word === chant.slice(-1)) return
    chant += word

    if (chant === "*?~") {
      spellFlag = "cast hold"
      chant = ""
    }
    else if (chant === "~?~") {
      spellFlag = "shield on"
      spellShield = 200
      chant = ""
    }
    else if (chant === "*#*") {
      spellFlag = "cast fireball"
      chant = ""
    }

    if (chant.length >= 3) chant = ""

    hudInfo.innerText = chant
  }

  function camFollowPlayer() {
    if (chars.length < 1) return
    const p = chars[0]
    controls.target.copy(p.position)
    controls.target.y += 2
    // adjust the camera's position relative to the target
    // maintain the current distance and angles
    const currentDistance = controls.getDistance();
    const currentAzimuthalAngle = controls.getAzimuthalAngle();
    const currentPolarAngle = controls.getPolarAngle();

    camera.position.setFromSphericalCoords(
        currentDistance,
        currentPolarAngle,
        currentAzimuthalAngle
    ).add(controls.target);

    // Ensure the camera is looking at the target
    camera.lookAt(controls.target);
  }

  animate()

  window.spellChant = spellChant

  window.addEventListener('resize', () => {
    const width = document.body.clientWidth // window.innerWidth
    const height = document.body.clientHeight // widow.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    composer.setSize(width, height)
    pixelPass.uniforms.resolution.value.set(width, height)
  });
}

function removeScene() {
  const container = document.getElementById('three-game');
  const canvas = container ? container.querySelector('canvas') : null;

  // 1. Stop animation loop (assuming you have animationFrameId)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // 2. Dispose of resources
  if (scene) {
    scene.traverse(function (object) {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
      if (object.material && object.material.map) object.material.map.dispose();
      if (object.material && object.material.normalMap) object.material.normalMap.dispose();
      // Dispose of other textures as needed
    });
  }

  // 3. Remove event listeners
  if (canvas) {
    // Remove any event listeners attached to the canvas or window
    window.removeEventListener('resize', onWindowResize);
    // canvas.removeEventListener('click', handleClick);
    // ... other listeners
  }

  // 4. Dispose of the renderer
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  // 5. Remove the container (and its children, including the canvas) from the DOM
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }

  // Optionally, clear references to scene and other Three.js objects
  scene = null;
  // ... other Three.js object references = null;
}

export {
  runGame,
  removeScene
}
