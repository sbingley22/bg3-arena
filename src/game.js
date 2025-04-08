import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPostProcessing } from './composer.js'
import * as character from "./character.js"
import { createGround } from './ground.js';
import { createBackground } from './background.js'

let scene
let renderer
let animationFrameId

function runGame(startLevel, level = 1) {
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

  character.resetGlobals()
  character.loadModel(scene, chars, charMixers, level)
  const bg = level === 4 ? "avernus" : level === 6 ? "forest" : "city"
  const ground = createGround(scene, bg)
  if (bg === "avernus") {
    renderer.domElement.style = "background: #500;"
    createBackground(scene, bg, [8,8,-10], [0,-Math.PI/2,0], [50,20], [1,1], [1.9,0.7,0.7])
    createBackground(scene, bg, [-8,8,-10], [0,Math.PI/2,0], [50,20], [1,1], [1.9,0.7,0.7])
    createBackground(scene, bg, [0,8,-48], [0,0,0], [30,20], [1,1], [1.9,0.7,0.7])
    createBackground(scene, bg, [0,8,12], [0,Math.PI,0], [30,20], [1,1], [1.9,0.7,0.7])
  }
  else if (bg === "forest") {
    createBackground(scene, bg, [8,10,-10], [0,-Math.PI/2,0], [60,27], [3,1], [0.4,0.4,0.4])
    createBackground(scene, bg, [-8,10,-10], [0,Math.PI/2,0], [60,27], [3,1], [0.4,0.4,0.4])
    createBackground(scene, bg, [0,10,-68], [0,0,0], [60,27], [3,1], [0.4,0.4,0.4])
    createBackground(scene, bg, [0,10,16], [0,Math.PI,0], [60,27], [3,1], [0.4,0.4,0.4])
  }
  else {
    renderer.domElement.style = "background: #321;"
    const col = [0.7,0.7,0.7]
    createBackground(scene, bg, [10,11,-10], [0,-Math.PI/2,0], [35,25], [1,1], col)
    createBackground(scene, bg, [-10,11,-10], [0,Math.PI/2,0], [35,25], [1,1], col)
    createBackground(scene, bg, [0,11,-28], [0,0,0], [30,25], [1,1], col)
    createBackground(scene, bg, [0,11,8], [0,Math.PI,0], [30,25], [1,1], col)
  }

  // Raycaster for detecting clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let lastClickTime = 0

  function handleInputStart(event) {
    // Prevent default touch behavior (like scrolling)
    event.preventDefault();

    let clientX, clientY;

    if (event.touches) {
      // Touch event
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // Mouse event
      if (event.button !== 0) return; // Only left mouse button
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const currentTime = performance.now();
    lastClickTime = currentTime;
  }

  function handleInputEnd(event) {
    event.preventDefault(); // Prevent default touch behavior

    let clientX, clientY;

    if (event.changedTouches) {
      // Touch event
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      // Mouse event
      if (event.button === 2) {
        chant = "";
        hudInfo.innerText = chant;
        return;
      }
      clientX = event.clientX;
      clientY = event.clientY;
    }

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    const currentTime = performance.now();
    const clickTime = currentTime - lastClickTime;
    if (clickTime > 200) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground, true);

    if (intersects.length > 0) {
      chars[0].userData.destination = intersects[0].point;
    } else {
      chars[0].userData.destination = null;
    }
  }

  const canvas = renderer.domElement; // Get your Three.js canvas element
  //canvas.addEventListener('touchmove', (event) => {
  //  event.preventDefault();
  //}, { passive: false });

  // Add event listeners for both mouse and touch
  canvas.addEventListener('mouseup', handleInputEnd);
  canvas.addEventListener('mousedown', handleInputStart);

  canvas.addEventListener('touchend', handleInputEnd);
  canvas.addEventListener('touchstart', handleInputStart, { passive: false }); // passive: false is important to allow preventDefault()

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
  let allEnemiesDead = false

  function updateGame() {
    spellFlag = null

    if (spellShield > 0) {
      spellShield -= 1
    }
    if (spellShield === 0) {
      spellShield = -99
      spellFlag = "shield off"
    }

    //Check for game over
    if (!allEnemiesDead && chars.length > 1) {
      let aliveEnemy = 0
      chars.forEach((c,index) => {
        if (index === 0) return
        if (c.userData.health && c.userData.health > 0) aliveEnemy += 1
      })
      if (aliveEnemy === 0) {
        allEnemiesDead = true
        setTimeout(() => {
          startLevel(level + 1)
        }, 1200);
      }
    }
    else {
      if (chars.length > 0) {
        if (chars[0].userData.health <= 0) {
          setTimeout(() => {
            startLevel(0)
          }, 1200);
        }
      }
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
    else if (chant === "*~?") {
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
    });
  }
  // 3. Remove event listeners
  if (canvas) {
    // Remove any event listeners attached to the canvas or window
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('mousedown');
    window.removeEventListener('mouseup');
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
  scene = null;
}

export {
  runGame,
  removeScene
}
