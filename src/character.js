import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import glb from "./assets/characters.glb?url"
import { createShadow } from "./shadow.js"

const charActiveAction = []
const charPreviousAction = []
let charAnimations = {}
let charModel

function loadModel(scene, chars, charMixers) {
  const loader = new GLTFLoader();

  loader.load(glb, (gltf) => {
    charModel = gltf.scene
    console.log(charModel)

    // Store animations by name
    gltf.animations.forEach((clip) => {
      charAnimations[clip.name] = clip;
    });
    //console.log(charAnimations)

    // Shart
    addCharacter(scene, chars, charMixers ,charModel, ["Ana", "Hair-Wavy", "Sword", "Shield"], [0,0,0], "Shadowheart")
    playCharAnimation(charMixers, 0, "Sword Idle")
    // Wyll
    addCharacter(scene, chars, charMixers, charModel, ["Adam", "HairM-Mowhawk", "Sword"], [0,0,6], "Wyll")
    playCharAnimation(charMixers, 1, "Sword Idle")
    changeMeshColor(chars[1], "adam", new THREE.Color(0x996644))
    changeMeshColor(chars[1], "adam_1", new THREE.Color(0x995544))
    // Astarion
    addCharacter(scene, chars, charMixers, charModel, ["Adam", "HairM-Mowhawk", "Pistol"], [-6,0,2], "Astarion")
    playCharAnimation(charMixers, 2, "Sword Idle")
    changeMeshColor(chars[2], "adam", new THREE.Color(0xEECCAA))
    changeMeshColor(chars[2], "adam_1", new THREE.Color(0x223344))
    changeMeshColor(chars[2], "HairM-Mowhawk", new THREE.Color(0x999999))
    // Gale
    addCharacter(scene, chars, charMixers, charModel, ["Adam", "Hair-Wavy"], [6,0,2], "Gale")
    playCharAnimation(charMixers, 3, "Idle")
    changeMeshColor(chars[3], "adam_1", new THREE.Color(0x446688))
    // Karlack
    addCharacter(scene, chars, charMixers ,charModel, ["Eve", "Hair-WavyPunk", "Sword"], [-3,0,-5], "Shadowheart")
    playCharAnimation(charMixers, 4, "Sword Idle")
    changeMeshColor(chars[4], "Eve", new THREE.Color(0xDD5544))
    // Lazel
    addCharacter(scene, chars, charMixers ,charModel, ["Lisa", "Hair-Parted", "Sword"], [3,0,-5], "Lazel")
    playCharAnimation(charMixers, 5, "Sword Idle")
    changeMeshColor(chars[5], "Plane003", new THREE.Color(0x55AA44))
    changeMeshColor(chars[5], "Hair-Parted", new THREE.Color(0x332233))
  });
}

function addCharacter(scene, chars, charMixers, mod, show, pos) {
  const clone = SkeletonUtils.clone(mod);
  clone.position.set(pos[0], pos[1], pos[2])
  showMeshes(clone, show)
  createShadow(clone)
  scene.add(clone);
  chars.push(clone)

  // Clone materials to prevent shared state
  clone.traverse((child) => {
    if (child.isMesh && child.material) {
      // If the mesh has an array of materials
      if (Array.isArray(child.material)) {
        child.material = child.material.map(mat => mat.clone());
      } else {
        child.material = child.material.clone();
      }
    }
  });

  const cloneMixer = new THREE.AnimationMixer(clone);
  charMixers.push(cloneMixer)
  charPreviousAction.push(null)
  charActiveAction.push(null)
}

// Function to play an animation by name with fade effect
function playCharAnimation(charMixers, index, name) {
  if (charMixers.length <= index) return
  const mixer = charMixers[index]
  if (!mixer || !charAnimations[name]) {
    console.warn(`Animation "${name}" not found`);
    return;
  }
  
  const newAction = mixer.clipAction(charAnimations[name]);
  if (charActiveAction[index] !== newAction) {
    charPreviousAction[index] = charActiveAction[index]
    charActiveAction[index]= newAction;
    
    if (charPreviousAction[index]) {
      charPreviousAction[index].fadeOut(0.1);
    }
    charActiveAction[index].reset().fadeIn(0.1).play();
    
    // If playing the Sword Slash animation, transition back to Sword Idle after playing once
    if (name === "Sword Slash") {
      charActiveAction[index].setLoop(THREE.LoopOnce, 1);
      charActiveAction[index].clampWhenFinished = true;
      // Remove any existing event listeners to prevent duplicates
      mixer.removeEventListener('finished');
      // Add new listener
      mixer.addEventListener('finished', () => {
        playCharAnimation(charMixers, index, "Sword Idle");
      });
    } else {
      charActiveAction[index].setLoop(THREE.LoopRepeat);
    }
  }
}

function showMeshes(obj, meshes) {
  // Hide all meshes
  obj.traverse((child) => {
    if (child.isMesh || child.type === "Group") {
      if (child.name === "Scene") return
      child.visible = false;
    }
  });
  // Show specific meshes
  obj.traverse((child) => {
    if (child.isMesh || child.type === "Group") {
      if (meshes.includes(child.name))
      {
        child.visible = true
        if (child.type === "Group") {
          child.children.forEach((ch) => ch.visible = true)
        }
      }
    }
  });
}

function changeMeshColor(obj, meshName, color) {
  obj.traverse((child) => {
    if (child.isMesh) {
      // Check if the child's name matches the specified mesh name
      if (child.name === meshName) {
        // Change the color of the material to the provided color
        child.material.color.set(color);
      }
    }
  });
}

function rotateToFace(object1, object2) {
  // Get the world position of the target object
  const targetPosition = new THREE.Vector3();
  object2.getWorldPosition(targetPosition);

  // Make object1 face object2
  object1.lookAt(targetPosition);
}

function aiTurn(chars) {
  for (let index = 1; index < chars.length; index++) {
    const c = chars[index];
    rotateToFace(c, chars[0])
  }
}

export {
  loadModel,
  playCharAnimation,
  addCharacter,
  showMeshes,
  changeMeshColor,
  aiTurn,
};
