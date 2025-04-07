import * as Game from './game.js'

const game = document.getElementById('game')
const cutscenes = document.getElementById('cutscenes')
const mainMenu = document.getElementById('main-menu')

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
  mainMenu.style.display = "block"
  game.style.display = "none"
  cutscenes.style.display = "none"
}

function showCutscene(cutscene) {
  removeThreeScene()
  cutscenes.style.display = "block"
  mainMenu.style.display = "none"
  game.style.display = "none"
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
    Game.runGame(2)
  }
}

startLevel(2)

//setTimeout(() => {
//  startLevel(1)
//}, 600);
//setTimeout(() => {
//  startLevel(2)
//}, 2600);
