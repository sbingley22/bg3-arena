import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import glb from "./assets/characters.glb?url"
import { createShadow } from "./shadow.js"
import { createSphere } from "./sphere.js"

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
    addCharacter(scene, chars, charMixers ,charModel, ["Ana", "Hair-Wavy", "Sword", "Shield"], [0,0,5], "Shadowheart", 0)
    playCharAnimation(charMixers, 0, "Sword Idle")
    chars[0].userData.speed = 2
    // Wyll
    addCharacter(scene, chars, charMixers, charModel, ["Adam", "HairM-Mowhawk", "Sword"], [0,0,-20], "Wyll", 1)
    playCharAnimation(charMixers, 1, "Sword Idle")
    changeMeshColor(chars[1], "adam", new THREE.Color(0x996644))
    changeMeshColor(chars[1], "adam_1", new THREE.Color(0x995544))
    // Astarion
    addCharacter(scene, chars, charMixers, charModel, ["Adam", "HairM-Mowhawk", "Pistol"], [-6,0,-30], "Astarion", 2)
    playCharAnimation(charMixers, 2, "Sword Idle")
    changeMeshColor(chars[2], "adam", new THREE.Color(0xEECCAA))
    changeMeshColor(chars[2], "adam_1", new THREE.Color(0x223344))
    changeMeshColor(chars[2], "HairM-Mowhawk", new THREE.Color(0x999999))
    // Gale
    addCharacter(scene, chars, charMixers, charModel, ["Adam", "Hair-Wavy"], [6,0,-10], "Gale", 3)
    playCharAnimation(charMixers, 3, "Idle")
    changeMeshColor(chars[3], "adam_1", new THREE.Color(0x446688))
    // Karlack
    addCharacter(scene, chars, charMixers ,charModel, ["Eve", "Hair-WavyPunk", "Sword"], [-3,0,-10], "Karlack", 4)
    playCharAnimation(charMixers, 4, "Sword Idle")
    changeMeshColor(chars[4], "Eve", new THREE.Color(0xDD5544))
    // Lazel
    addCharacter(scene, chars, charMixers ,charModel, ["Lisa", "Hair-Parted", "Sword"], [3,0,-2], "Lazel", 5)
    playCharAnimation(charMixers, 5, "Sword Idle")
    changeMeshColor(chars[5], "Plane003", new THREE.Color(0x55AA44))
    changeMeshColor(chars[5], "Hair-Parted", new THREE.Color(0x332233))
  });
}

function addCharacter(scene, chars, charMixers, mod, show, pos, name, index) {
  const clone = SkeletonUtils.clone(mod);
  clone.position.set(pos[0], pos[1], pos[2])
  showMeshes(clone, show)
  createShadow(clone)
  createSphere(clone)
  clone.name = name
  clone.userData.health = 100
  clone.userData.index = index
  clone.userData.speed = 1.0
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
  cloneMixer.addEventListener('finished', (e) => {
    const finishedAction = e.action.getClip().name
    //console.log(charMixers)
    if (["Sword Slash", "Take Damage", "Fight Jab"].includes(finishedAction)) {
      playCharAnimation(charMixers, index, "Sword Idle");
    }
  })
  charMixers.push(cloneMixer)
  charPreviousAction.push(null)
  charActiveAction.push(null)
}

function animHierachy(currentAnim, anim) {
  const basic = ["Idle", "Jogging", "Walking", "Pistol Aim", "Pistol Idle"]
  const medium = ["Pistol Fire", "Fight Jab", "Take Damage", "Sword Slash"]
  if (currentAnim === "Die") return
  if (basic.includes(currentAnim)) return true
  if (basic.includes(anim) && medium.includes(currentAnim)) return false
  return true
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
    if (charActiveAction[index]) { 
      const canTransition = animHierachy(charActiveAction[index].getClip().name, name)
      if (!canTransition) return
    }

    charPreviousAction[index] = charActiveAction[index]
    charActiveAction[index] = newAction;
    
    if (charPreviousAction[index]) {
      charPreviousAction[index].fadeOut(0.1);
    }
    charActiveAction[index].reset().fadeIn(0.1).play();
    
    if (["Sword Slash", "Take Damage", "Fight Jab"].includes(name)) {
      charActiveAction[index].setLoop(THREE.LoopOnce, 1);
      charActiveAction[index].clampWhenFinished = true;
    } 
    else if (["Die"].includes(name)) {
      charActiveAction[index].setLoop(THREE.LoopOnce, 1);
      charActiveAction[index].clampWhenFinished = true;
    } 
    else {
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

function changeMeshColor(obj, meshName, color, childIndex=0) {
  obj.traverse((child) => {
    if (child.isMesh) {
      // Check if the child's name matches the specified mesh name
      if (child.name === meshName) {
        // Change the color of the material to the provided color
        child.material.color.set(color);
      }
    }
    else if (child.type === "Group") {
      if (child.name === meshName) {
        if (child.children.length > childIndex) {
          child.children[childIndex].material.color.set(color);
        }
      }
    }
  });
}

function rotateToFace(object1, object2) {
  const targetPosition = new THREE.Vector3();
  object2.getWorldPosition(targetPosition);
  object1.lookAt(targetPosition);
}
function rotateToPos(object1, object2) {
  object1.lookAt(object2);
}

function moveTo(ch, pos, minimumDistance = 0.01, delta) {
  const dist = ch.position.distanceTo(pos)
  if (dist < minimumDistance) return true
  const charSpeed = ch.userData.speed
  const speed = charSpeed * delta
  const direction = new THREE.Vector3().subVectors(pos, ch.position).normalize();
  let slope = dist
  if (slope > 1) slope = 1
  else if (slope < 0.5) slope = 0.5
  const step = direction.multiplyScalar(speed * slope)

  // Prevent overshooting the target
  if (step.length() > dist) {
    ch.position.copy(pos);
    return true
  } else {
    ch.position.add(step);
  }
  return false
}

function findNearestChar(i, chars) {
  let nearestDistance = 999
  let nearestChar = -1
  chars.forEach((ch, index) => {
    if (index === i) return
    if (ch.userData.health <= 0) return
    const dist = ch.position.distanceTo(chars[i].position)
    if (dist < nearestDistance) {
      nearestDistance = dist
      nearestChar = index
    }
  })
  return nearestChar
}

function sphereChange(ch, opacity, color) {
  ch.children.forEach(o => {
    if (o.name === "Sphere") {
      o.material.opacity = opacity
      if (color !== null) o.material.color.set(color)
    }
  });
}

function aiTurn(chars, delta) {
  for (let index = 1; index < chars.length; index++) {
    const c = chars[index];

    if (c.userData.held && c.userData.held > 0) {
      c.userData.held -= 1
      if (c.userData.held === 0) sphereChange(c, 0, null)
      continue
    }
    
    if (c.userData.burning && c.userData.burning > 0) {
      c.userData.burning -= 1
      if (c.userData.burning === 0) sphereChange(c, 0, null)
      continue
    }

    if (c.userData.health <= 0) continue

    rotateToFace(c, chars[0])
    moveTo(c, chars[0].position, 1, delta)
  }
}

function playerUpdate(chars, charMixers, spellFlag, delta) {
  if (chars.length < 1) return
  const p = chars[0]

  if (spellFlag === "shield on") {
    changeMeshColor(p, "Shield", new THREE.Color(0x5533FF), 1)
  }
  else if (spellFlag === "shield off") {
    changeMeshColor(p, "Shield", new THREE.Color(0x332211), 1)
  }
  else if (spellFlag === "cast fireball") {
    const ci = findNearestChar(0, chars)
    if (ci != -1) {
      playCharAnimation(charMixers, 0, "Fight Jab")
      rotateToFace(p, chars[ci])
      chars[ci].userData.health -= 35
      if (chars[ci].userData.health <= 0) playCharAnimation(charMixers, ci, "Die")
      else playCharAnimation(charMixers, ci, "Take Damage")
      chars[ci].userData.burning = 30
      sphereChange(chars[ci], 0.4, 0xFFAA22)
    }
  }
  else if (spellFlag === "cast hold") {
    const ci = findNearestChar(0, chars)
    if (ci != -1) {
      rotateToFace(p, chars[ci])
      playCharAnimation(charMixers, 0, "Fight Jab")
      chars[ci].userData.held = 300
      sphereChange(chars[ci], 0.6, 0x224499)
    }
  }

  if (p.userData.destination && p.userData.destination !== null) {
    if (moveTo(p, p.userData.destination, 0.05, delta)) {
      playCharAnimation(charMixers, 0, "Sword Idle")
      p.userData.destination = null
    }
    else {
      playCharAnimation(charMixers, 0, "Walking")
      rotateToPos(p, p.userData.destination)
    }
  }
}

export {
  loadModel,
  playCharAnimation,
  addCharacter,
  showMeshes,
  changeMeshColor,
  aiTurn,
  playerUpdate,
  moveTo,
};
