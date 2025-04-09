import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import glb from "./assets/characters.glb?url"
import { createShadow } from "./shadow.js"
import { createSphere } from "./sphere.js"

let charActiveAction = []
let charPreviousAction = []
let charAnimations = {}
let charModel

function loadModel(scene, chars, charMixers, level) {
  const loader = new GLTFLoader();

  loader.load(glb, (gltf) => {
    charModel = gltf.scene
    //console.log(charModel)

    // Store animations by name
    gltf.animations.forEach((clip) => {
      charAnimations[clip.name] = clip;
    });
    //console.log(charAnimations)

    let charIndex = 0
    // Shart
    const posZ = level === 2 ? 3 : level === 4 ? 5 : 6
    addCharacter(scene, chars, charMixers ,charModel, ["Ana", "Hair-Wavy", "Sword", "Shield"], [0,0,posZ], "Shadowheart", charIndex, "all")
    playCharAnimation(charMixers, charIndex, "Idle")
    chars[charIndex].userData.speed = 2
    chars[charIndex].userData.health = 100
    chars[charIndex].userData.mana = 100
    charIndex += 1
    // Wyll
    if (level === 4) {
      addCharacter(scene, chars, charMixers, charModel, ["Adam", "HairM-Mowhawk", "Sword"], [0,0,-5], "Wyll", charIndex, "melee")
      playCharAnimation(charMixers, charIndex, "Idle")
      changeMeshColor(chars[charIndex], "adam", new THREE.Color(0x996644))
      changeMeshColor(chars[charIndex], "adam_1", new THREE.Color(0x995544))
      charIndex += 1
    }
    // Astarion
    if (level === 2) {
      addCharacter(scene, chars, charMixers, charModel, ["Adam", "HairM-Mowhawk", "Pistol"], [-2,0,-21], "Astarion", charIndex, "archer", [1,0.9,1])
      playCharAnimation(charMixers, charIndex, "Idle")
      changeMeshColor(chars[charIndex], "adam", new THREE.Color(0xEECCAA))
      changeMeshColor(chars[charIndex], "adam_1", new THREE.Color(0x223344))
      changeMeshColor(chars[charIndex], "HairM-Mowhawk", new THREE.Color(0x999999))
      charIndex += 1
    }
    // Gale
    if (level === 6) {
      addCharacter(scene, chars, charMixers, charModel, ["Adam", "Hair-Wavy"], [-1,0,-27], "Gale", charIndex, "mage")
      playCharAnimation(charMixers, charIndex, "Idle")
      changeMeshColor(chars[charIndex], "adam_1", new THREE.Color(0x446688))
      charIndex += 1
    }
    // Karlack
    if (level === 4) {
      addCharacter(scene, chars, charMixers ,charModel, ["Eve", "Hair-WavyPunk", "Sword"], [0.5,0,-25], "Karlack", charIndex, "melee", [1.1,1.1,1.1])
      playCharAnimation(charMixers, charIndex, "Idle")
      changeMeshColor(chars[charIndex], "Eve", new THREE.Color(0xDD5544))
      charIndex += 1
    }
    // Lazel
    if (level === 6) {
      addCharacter(scene, chars, charMixers ,charModel, ["Lisa", "Hair-Parted", "Sword"], [3,0,-27], "Lazel", charIndex, "melee")
      playCharAnimation(charMixers, charIndex, "Idle")
      changeMeshColor(chars[charIndex], "Plane003", new THREE.Color(0x55AA44))
      changeMeshColor(chars[charIndex], "Hair-Parted", new THREE.Color(0x332233))
      charIndex += 1
    }

    // Grunts
    if (level === 2) {
      const vamps = [[3,0,-7], [2.5, 0, -20], [0, 0, -19]]
      vamps.forEach((v,index) => {
        addCharacter(scene, chars, charMixers ,charModel, ["Lisa", "Hair-Parted", "Sword"], v, "vamp", charIndex, "melee", [1, 0.8, 1])
        playCharAnimation(charMixers, charIndex, "Idle")
        changeMeshColor(chars[charIndex], "Plane003", new THREE.Color(0x99DDFF))
        changeMeshColor(chars[charIndex], "Hair-Parted", new THREE.Color(0x332233))
        charIndex += 1
      })
      const vamps2 = [[-3,0,-7]]
      vamps2.forEach((v,index) => {
        addCharacter(scene, chars, charMixers, charModel, ["Adam", "Pistol"], v, "vamp2", charIndex, "archer", [1, 1.1, 1])
        playCharAnimation(charMixers, charIndex, "Idle")
        changeMeshColor(chars[charIndex], "adam", new THREE.Color(0x8888AA))
        changeMeshColor(chars[charIndex], "adam_1", new THREE.Color(0x99AA99))
        charIndex += 1
      })
    }
    else if (level === 4) {
      const blades = [[3,0,-7], [-3,0,-7]]
      blades.forEach((v,index) => {
        addCharacter(scene, chars, charMixers ,charModel, ["Adam", "Pistol"], v, "Blade", charIndex, "archer", [1, 0.98, 1])
        playCharAnimation(charMixers, charIndex, "Idle")
        charIndex += 1
      })
      const demons = [[-3,0,-20], [2.5, 0, -20], [0, 0, -19]]
      demons.forEach((v,index) => {
        addCharacter(scene, chars, charMixers, charModel, ["Eve"], v, "Demon", charIndex, "mage", [0.8, 0.7, 0.8])
        playCharAnimation(charMixers, charIndex, "Idle")
        changeMeshColor(chars[charIndex], "Eve", new THREE.Color(0xaa5544))
        charIndex += 1
      })
    }
    else if (level === 6) {
      const gith = [[0,0,-0], [3,0,-4], [4,0,-10], [-3,0,-7], [2,0,-16], [-3,0,-22]]
      gith.forEach((v,index) => {
        addCharacter(scene, chars, charMixers ,charModel, ["Ana", "Hair-TiedBack", "Sword", "Shield"], v, "Shadowheart", charIndex, "melee", [0.9,0.95,0.9])
        playCharAnimation(charMixers, charIndex, "Idle")
        changeMeshColor(chars[charIndex], "ana", new THREE.Color(0x55aa44))
        changeMeshColor(chars[charIndex], "ana_1", new THREE.Color(0xaabbcc))
        charIndex += 1
      })
    }

  });
}

function addCharacter(scene, chars, charMixers, mod, show, pos, name, index, combatType, scale=[1,1,1]) {
  const clone = SkeletonUtils.clone(mod);
  clone.position.set(pos[0], pos[1], pos[2])
  clone.scale.set(...scale)
  showMeshes(clone, show)
  createShadow(clone)
  createSphere(clone)
  clone.name = name
  clone.userData.health = 100
  clone.userData.index = index
  clone.userData.speed = 1.0
  clone.userData.reload = 1.0
  clone.userData.combatType = combatType
  clone.userData.status = "neutral"
  //console.log(clone)

  scene.add(clone)
  chars.push(clone)

  // Clone materials to prevent shared state
  clone.traverse((child) => {
    if (child.isMesh && child.material) {
      // If the mesh has an array of materials
      if (Array.isArray(child.material)) {
        child.material = child.material.map(mat => mat.clone())
      } else {
        child.material = child.material.clone()
      }
    }
  })

  const cloneMixer = new THREE.AnimationMixer(clone)
  cloneMixer.addEventListener('finished', (e) => {
    const finishedAction = e.action.getClip().name
    //console.log(charMixers)
    if (["Sword Slash", "Take Damage", "Fight Jab", "Pistol Fire"].includes(finishedAction)) {
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
  if (currentAnim === "Die") return false
  if (basic.includes(currentAnim)) return true
  if (basic.includes(anim) && medium.includes(currentAnim)) return false
  return true
}

// Function to play an animation by name with fade effect
function playCharAnimation(charMixers, index, name) {
  if (charMixers.length <= index) {
    console.warn("index is bigger than char mixers length")
    return
  }
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
    
    if (["Sword Slash", "Take Damage", "Fight Jab", "Pistol Fire"].includes(name)) {
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
  return [nearestChar, nearestDistance]
}

function distanceToPlayer(chars, ch) {
  return ch.position.distanceTo(chars[0].position)
}

function sphereChange(ch, opacity, color) {
  ch.children.forEach(o => {
    if (o.name === "Sphere") {
      o.material.opacity = opacity
      if (color !== null) o.material.color.set(color)
    }
  });
}

function becomeHostile(chars, charMixers, c, i) {
  c.userData.status = "hostile"
  playCharAnimation(charMixers, i, "Sword Idle")

  chars.forEach((ch, index) => {
    if (index === i) return
    if (ch.userData.health <= 0) return
    const dist = ch.position.distanceTo(chars[i].position)
    if (dist < 10) {
      ch.userData.status = "hostile"
      playCharAnimation(charMixers, index, "Sword Idle")
    }
  })
}

function aiTurn(chars, charMixers, delta, startLevel) {
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

    if (c.userData.status === "hostile") {
      hostileAi(chars, charMixers, c, index, delta, startLevel)
    } else {
      const dist = distanceToPlayer(chars, c)
      if (dist < 10) becomeHostile(chars, charMixers, c, index)
    }
  }
}

function hostileAi(chars, charMixers, c, index, delta, startLevel) {
  rotateToFace(c, chars[0])
  chars[index].userData.reload -= delta

  const combatType = c.userData.combatType
  if (combatType === "mage") {
    if (moveTo(c, chars[0].position, 5, delta)) {
      // in striking range
      if (charActiveAction[index].getClip().name === "Sword Idle" && chars[index].userData.reload <= 0) {
        playCharAnimation(charMixers, index, "Fight Jab")
        setTimeout(() => {
          damagePlayer(chars, charMixers, 10, startLevel)
        }, 200);
        chars[index].userData.reload = 4.0
      }
      else if (charActiveAction[index].getClip().name === "Walking") {
        playCharAnimation(charMixers, index, "Sword Idle")
      }
    }
  }
  else if (combatType === "archer") {
    if (moveTo(c, chars[0].position, 8, delta)) {
      if (charActiveAction[index].getClip().name === "Sword Idle" && chars[index].userData.reload <= 0) {
        playCharAnimation(charMixers, index, "Pistol Fire")
        setTimeout(() => {
          damagePlayer(chars, charMixers, 5, startLevel)
        }, 200);
        chars[index].userData.reload = 3.0
      }
      else if (charActiveAction[index].getClip().name === "Walking") {
        playCharAnimation(charMixers, index, "Sword Idle")
      }
    }
    else {
      playCharAnimation(charMixers, index, "Walking")
    }
  }
  else {
    if (moveTo(c, chars[0].position, 1, delta)) {
      if (charActiveAction[index].getClip().name === "Sword Idle" && chars[index].userData.reload <= 0) {
        playCharAnimation(charMixers, index, "Sword Slash")
        setTimeout(() => {
          damagePlayer(chars, charMixers, 5, startLevel)
        }, 200);
        chars[index].userData.reload = 1.0
      }
      else if (charActiveAction[index].getClip().name === "Walking") {
        playCharAnimation(charMixers, index, "Sword Idle")
      }
    }
    else {
      playCharAnimation(charMixers, index, "Walking")
    }
  }
}

function playerUpdate(chars, charMixers, spellFlag, delta) {
  if (chars.length < 1) return
  const p = chars[0]

  p.userData.health += delta * 0.2
  if (p.userData.health > 100) p.userData.health = 100

  p.userData.mana += delta * 2.5
  if (p.userData.mana > 100) p.userData.mana = 100

  const manaElement = document.getElementById('hud-status')
  manaElement.innerText = "Mana: " + Math.floor(p.userData.mana)

  // Cast spells
  if (p.userData.mana > 0) {
    manaElement.style.color = 'lightblue'
    if (spellFlag === "shield on") {
      changeMeshColor(p, "Shield", new THREE.Color(0x5533FF), 1)
      sphereChange(chars[0], 0.4, 0x2233AA)
      p.userData.mana -= 20
      p.userData.shield = true
    }
    else if (spellFlag === "shield off") {
      changeMeshColor(p, "Shield", new THREE.Color(0x332211), 1)
      sphereChange(chars[0], 0.0, 0x2233AA)
      p.userData.shield = false
    }
    else if (spellFlag === "cast fireball") {
      const [ci,cd] = findNearestChar(0, chars)
      if (ci != -1 && cd < 6) {
        playCharAnimation(charMixers, 0, "Fight Jab")
        rotateToFace(p, chars[ci])
        p.userData.destination = null
        setTimeout(() => {
          damageChar(chars, charMixers, ci, 35)
          chars[ci].userData.burning = 30
          sphereChange(chars[ci], 0.4, 0xFFAA22)
        }, 200);
        p.userData.mana -= 10
      }
    }
    else if (spellFlag === "cast hold") {
      const [ci,cd] = findNearestChar(0, chars)
      if (ci != -1 && cd < 5) {
        rotateToFace(p, chars[ci])
        playCharAnimation(charMixers, 0, "Fight Jab")
        chars[ci].userData.held = 300
        sphereChange(chars[ci], 0.6, 0x224499)
        p.userData.destination = null
        p.userData.mana -= 10
      }
    }
  }
  else {
    manaElement.style.color = 'red'
  }

  // Move to destination
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
  else {
    //try attacking
    const [ci,cd] = findNearestChar(0, chars)
    if (ci != -1 && cd <= 1.5 && charActiveAction[0].getClip().name === "Sword Idle") {
      playCharAnimation(charMixers, 0, "Sword Slash")
      rotateToFace(p, chars[ci])
      setTimeout(() => {
        damageChar(chars, charMixers, ci, 20)
      }, 200);
    }
  }
}

function damagePlayer(chars, charMixers, dmg, startLevel) {
  if (chars[0].userData.shield) return

  const portrait = document.getElementById('char-face')
  chars[0].userData.health -= dmg

  if (chars[0].userData.health <= 0) {
    playCharAnimation(charMixers, 0, "Die")
    setTimeout(() => {
      startLevel(0)
    }, 2000);
  }
  else {
    playCharAnimation(charMixers, 0, "Take Damage")
    if (portrait) {
      portrait.style.backgroundColor = 'red'
      setTimeout(() => {
        portrait.style.backgroundColor = 'transparent'
      }, 100);
    }
  }

  if (chars[0].userData.health <= 30) portrait.style.borderRightColor = 'red' 
  else if (chars[0].userData.health <= 60) portrait.style.borderRightColor = 'yellow' 
  else portrait.style.borderRightColor = 'green' 
}

function damageChar(chars, charMixers, ci, dmg) {
  chars[ci].userData.health -= dmg
  if (chars[ci].userData.health <= 0) playCharAnimation(charMixers, ci, "Die")
  else playCharAnimation(charMixers, ci, "Take Damage")
}

function resetGlobals() {
  charActiveAction = []
  charPreviousAction = []
  charAnimations = {}
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
  resetGlobals,
}
