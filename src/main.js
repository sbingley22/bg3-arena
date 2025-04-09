import * as Game from './game.js'

const game = document.getElementById('game')
const cutscenes = document.getElementById('cutscenes')
const mainMenu = document.getElementById('main-menu')
const retroCheckbox = document.getElementById('retroCheckbox')
const boomerCheckbox = document.getElementById('boomerCheckbox')
const noiseCheckbox = document.getElementById('noiseCheckbox')

function removeThreeScene() {
  const threeGame = document.getElementById('three-game')
  if (!threeGame) return
  Game.removeScene()
}

function showGame() {
  game.style.display = "block"
  cutscenes.style.display = "none"
  mainMenu.style.display = "none"
}

function showMainMenu() {
  removeThreeScene()
  mainMenu.style.display = "grid"
  game.style.display = "none"
  cutscenes.style.display = "none"
}

function showCutscene(cutscene) {
  removeThreeScene()
  cutscenes.style.display = "block"
  mainMenu.style.display = "none"
  game.style.display = "none"

  const children = cutscenes.children;
  const targetId = "cutscene-" + cutscene
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.id !== targetId) {
      child.style.display = 'none';
    } else {
      child.style.display = '';
    }
  }
}

function startLevel(level) {
  if (level === 0) {
    showMainMenu()
  }
  else if (level === 1) {
    showCutscene(1)
  }
  else if (level === 2) {
    showGame()
    Game.runGame(startLevel, 2, retroCheckbox.checked, boomerCheckbox.checked, noiseCheckbox.checked)
  }
  else if (level === 3) {
    showCutscene(3)
  }
  else if (level === 4) {
    showGame()
    Game.runGame(startLevel, 4, retroCheckbox.checked, boomerCheckbox.checked, noiseCheckbox.checked)
  }
  else if (level === 5) {
    showCutscene(5)
  }
  else if (level === 6) {
    showGame()
    Game.runGame(startLevel, 6, retroCheckbox.checked, boomerCheckbox.checked, noiseCheckbox.checked)
  }
  else if (level === 7) {
    showCutscene(7)
  }
}

startLevel(0)

window.startLevel = startLevel
