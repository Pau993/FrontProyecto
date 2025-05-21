<template>
  <div class="game-container">
    <canvas ref="gameCanvas" :width="SCREEN_WIDTH" :height="SCREEN_HEIGHT"></canvas>

    <div class="game-hud">
      <div class="player-info">
        <span class="player-name">Jugador: {{ playerName }}</span>
        <span class="license-plate">Placa: {{ playerId }}</span>
        <span class="score">Personas: {{ player.hasPerson }}</span>
        <span class="players-online">Jugadores Online: {{ otherPlayers.size + 1 }}</span>
      </div>
    </div>

    <div v-if="collisionState.debug" class="collision-debug">
      <div v-if="collisionState.lastCollision" class="collision-message">
        ¡Colisión detectada!
        Jugadores: {{ collisionState.lastCollision.player1 }} y {{ collisionState.lastCollision.player2 }}
      </div>
    </div>

    <div v-if="gameOver" class="end-game-overlay result-container">
      <div class="game-over-content">
        <transition name="fade">
          <div :class="['result-message', isWinner ? 'glow' : '']">
            {{ isWinner ? "You Win!" : "Game Over" }}
          </div>
        </transition>
        
        <div v-if="!showThankYou" class="buttons-container">
          <button class="action-button play-again" @click="playAgain">Volver a jugar</button>
          <button class="action-button exit" @click="exitGame">No</button>
        </div>
        
        <div v-if="showThankYou" class="thank-you-message">
          Gracias por jugar
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { TileManager } from '~/utils/TileManager.js'
import { Player } from '~/utils/Player.js'
import { AssetSetter } from '~/utils/AssetSetter'
import { CollisionChecker } from '~/utils/CollisionChecker'
import { KeyHandler } from '~/utils/KeyHandler'
import { WebSocketService } from '~/utils/WebSocketService'
import confetti from 'canvas-confetti';

// Game constants
const ORIGINAL_TILE_SIZE = 26
const SCALE = 3
const TILE_SIZE = ORIGINAL_TILE_SIZE * SCALE
const MAX_SCREEN_COL = 16
const MAX_SCREEN_ROW = 12
const SCREEN_WIDTH = TILE_SIZE * MAX_SCREEN_COL
const SCREEN_HEIGHT = TILE_SIZE * MAX_SCREEN_ROW
const FPS = 60

// Refs
const keyHandler = ref(new KeyHandler())
const gameCanvas = ref(null)
const gameLoop = ref(null)
const tileManager = ref(null)
const player = ref(new Player(SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE))
const objects = ref(new Array(15).fill(null))
const collisionChecker = ref(null)
const webSocket = ref(new WebSocketService())
const otherPlayers = ref(new Map())
const collisionState = ref({ lastCollision: null, debug: false })
const playerId = ref(localStorage.getItem('licensePlate') || '')

const gameOver = ref(false);
const isWinner = ref(false);

const playerName = ref('')
const playerPlate = ref('')

const showThankYou = ref(false)

// Game initialization
const initGame = async () => {
  tileManager.value = new TileManager(MAX_SCREEN_COL, MAX_SCREEN_ROW, TILE_SIZE)
  collisionChecker.value = new CollisionChecker(TILE_SIZE, tileManager.value)
  const assetSetter = new AssetSetter(TILE_SIZE)

  webSocket.value.onInitialData = async (serverData) => {
    objects.value = await assetSetter.setObjects(serverData)
  }

  webSocket.value.setInitialDataCallback(async (serverData) => {
    console.log('Initializing game with server data');
    objects.value = await assetSetter.setObjects(serverData);
  });

  await Promise.all([
    tileManager.value.loadTiles(),
    player.value.loadImages(),
    assetSetter.setObjects().then(loadedObjects => {
      objects.value = loadedObjects
    })
  ])

  // Example map data - replace with your actual map
  const mapData = `
    15 16 1 6 3 1 6 2 1 6 1 8 6 2 18 15
    1 6 2 6 21 14 6 1 4 6 20 1 6 1 6 2
    1 17 15 5 15 15 5 15 15 5 15 15 5 15 19 1
    2 9 0 6 1 7 6 1 3 6 1 8 6 4 1 0
    20 1 1 6 10 1 6 1 2 6 21 1 6 1 11 2
    15 15 15 5 15 15 5 15 15 5 15 15 5 15 15 15
    1 2 1 6 4 2 6 1 12 6 1 3 6 2 10 1
    3 1 11 6 1 14 6 1 1 6 7 1 6 1 2 1
    1 1 2 6 2 1 6 0 1 6 1 1 6 20 1 1
    1 18 15 5 15 15 5 15 15 5 15 15 5 15 16 9
    9 6 2 6 1 1 6 10 20 6 14 2 6 14 6 1
    15 19 1 6 12 2 6 1 1 6 1 1 6 1 17 15

`
  await tileManager.value.loadMap(mapData)

  // Setup WebSocket handlers
  webSocket.value.onPlayersUpdate = async (playerData) => {
    const localId = webSocket.value.getLocalPlayerId();

    if (playerData.type === 'personState') {
      const personId = playerData.personId;
      const isActive = playerData.active;

      // Find the person object and update its state
      const person = objects.value.find(obj => obj && obj.id === personId);
      if (person) {
        person.active = isActive;
        console.log(`🎭 Person ${personId} state updated to ${isActive} by player ${playerData.playerId}`);
      }
      return;
    }

    // Update local player's plate if it matches
    if (playerData.id === localId) {
      playerId.value = playerData.id; // Update the displayed plate
      player.value.id = playerData.id;
    }

    // If player doesn't exist in otherPlayers, create it
    if (!otherPlayers.value.has(playerData.id) && playerData.id !== localId) {
      const newPlayer = new Player(SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE, playerData.id);
      await newPlayer.loadImages();
      otherPlayers.value.set(playerData.id, newPlayer);
    }

    // Update player position if it's not the local player
    if (playerData.id !== localId) {
      const otherPlayer = otherPlayers.value.get(playerData.id);
      if (otherPlayer) {
        // Check if hasPerson is being updated
        const hasPersonChanged = 'hasPerson' in playerData && otherPlayer.hasPerson !== playerData.hasPerson;
        // Update player properties
        otherPlayer.x = playerData.x ?? otherPlayer.x;
        otherPlayer.y = playerData.y ?? otherPlayer.y;
        otherPlayer.direction = playerData.direction ?? otherPlayer.direction;

        if (hasPersonChanged) {
          otherPlayer.hasPerson = playerData.hasPerson;
          otherPlayer.getCurrentImage();
          console.log('🎮 Player Update:', {
            id: playerData.id,
            hasPerson: playerData.hasPerson,
            timestamp: new Date().toISOString()
          });
          if (otherPlayer.hasPerson >= 7 && !gameOver.value) {
            endGame(playerData.id === webSocket.value.getLocalPlayerId());
          }
        }

      }
    }

  };

  webSocket.value.onPlayerDisconnect = (id) => {
    otherPlayers.value.delete(id);
  };

  webSocket.value.onConnect = (id) => {
    playerId.value = id;
    player.value.id = id;
    localStorage.setItem('licensePlate', id); // Save the new plate to localStorage
  };
}

function playAgain() {
  window.location.href = '/generation'
}

function exitGame() {
  showThankYou.value = true
}

function endGame(winner) {
  gameOver.value = true
  isWinner.value = winner

  if (winner) {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  cancelAnimationFrame(gameLoop.value)
  webSocket.value?.close()
}

// Drawing
const draw = () => {
  const ctx = gameCanvas.value.getContext('2d')
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

  // Draw background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

  // Draw tiles
  if (tileManager.value) {
    tileManager.value.draw(ctx)
  }

  console.log()
  const localPlayerId = webSocket.value.getLocalPlayerId()
  const allPlayers = [...otherPlayers.value.values()].filter(p => p.id !== localPlayerId)

  // Sort players by Y position so players lower on screen appear in front
  allPlayers.sort((a, b) => a.y - b.y)

  // Draw objects and players in correct order
  for (let y = 0; y < SCREEN_HEIGHT; y++) {
    // Draw objects at this Y level
    objects.value.forEach(obj => {
      if (obj && obj.y === y) {
        obj.draw(ctx, { tileSize: TILE_SIZE })
      }
    })

    // Draw players at this Y level
    allPlayers.forEach(p => {
      if (Math.floor(p.y) === y) {
        p.draw(ctx)
      }
    })
  }

  // Draw local player last (to appear on top)
  player.value.draw(ctx)
}

// Game state
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
}

// Game loop
const update = () => {

  if (player.value && collisionChecker.value) {
    const keys = {
      up: keyHandler.value.upPressed,
      down: keyHandler.value.downPressed,
      left: keyHandler.value.leftPressed,
      right: keyHandler.value.rightPressed
    }

    // Convertir otros jugadores a array para las colisiones
    const otherPlayersArray = [...otherPlayers.value.values()]

    if (player.value.update(keys, collisionChecker.value, objects.value, webSocket.value, otherPlayersArray)) {
      // Only send update if player state changed
      webSocket.value.sendPlayerPosition({
        id: webSocket.value.getLocalPlayerId(),
        x: player.value.x,
        y: player.value.y,
        direction: player.value.direction,
        hasPerson: player.value.hasPerson
      })
    }

    if (player.value.hasPerson >= 7 && !gameOver.value) {
      endGame(true);
    }
    // Actualizar estado de colisiones si está en modo debug
    if (collisionState.value.debug) {
      otherPlayersArray.forEach(otherPlayer => {
        if (collisionChecker.value.checkPlayerCollision(player.value, [otherPlayer])) {
          collisionState.value.lastCollision = {
            time: Date.now(),
            player1: player.value.id,
            player2: otherPlayer.id
          }
        }
      })
    }

  }
}

const gameStep = () => {
  update()
  draw()
  gameLoop.value = requestAnimationFrame(gameStep)
}

// Update onMounted to initialize WebSocket
onMounted(async () => {
  // Load player info from localStorage
  playerName.value = localStorage.getItem('playerName') || 'Unknown'
  playerPlate.value = localStorage.getItem('licensePlate') || 'XXX-000'
  
  await initGame()
  keyHandler.value.init()
  webSocket.value.connect()
  gameStep()
})

// Update onUnmounted to cleanup WebSocket
onUnmounted(() => {
  keyHandler.value.cleanup()
  webSocket.value.disconnect() // Disconnect WebSocket
  if (gameLoop.value) {
    cancelAnimationFrame(gameLoop.value)
  }
})


</script>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/assets/fondo3.jpeg');
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.game-hud {
  position: absolute;
  top: 20px;
  left: 20px;
  color: red;
  font-family: 'Press Start 2P', Arial, sans-serif;
  font-size: 20px;
  text-shadow: 2px 2px 0 black;
}

/* Añade dentro de <style scoped> */
.collision-debug {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  color: #ff0000;
  font-family: monospace;
}

.collision-message {
  color: #ff0000;
  font-weight: bold;
}

.end-game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  color: #fff;
  font-size: 3rem;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  60% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.result-message {
  animation: popIn 0.8s ease-out;
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px #000;
  margin-top: 20px;
}

@keyframes glow {
  0% {
    text-shadow: 0 0 5px #fff, 0 0 10px #ff0, 0 0 20px #f0f, 0 0 30px #f0f;
  }

  50% {
    text-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 25px #0ff, 0 0 35px #0ff;
  }

  100% {
    text-shadow: 0 0 5px #fff, 0 0 10px #ff0, 0 0 20px #f0f, 0 0 30px #f0f;
  }
}

.result-message.glow {
  animation: popIn 0.8s ease-out, glow 2s infinite alternate;
}

.game-hud {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Press Start 2P', Arial, sans-serif;
  font-size: 20px;
  text-shadow: 2px 2px 0 black;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}

.player-name {
  color: #44c767;
  font-size: 16px;
}

.license-plate {
  color: #4ae257;
  font-size: 18px;
  font-weight: bold;
}

.game-over-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.buttons-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.action-button {
  padding: 12px 30px;
  background-color: #4ae257;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.action-button:hover {
  background-color: #63c58c;
  transform: scale(1.05);
}

.action-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}


.play-again {
  background: linear-gradient(45deg, #44c767, #2eab4e);
  color: white;
}

.play-again:hover {
  background: linear-gradient(45deg, #4dd772, #33bc55);
}

.exit {
  background: linear-gradient(45deg, #ff4444, #cc3333);
  color: white;
}

.exit:hover {
  background: linear-gradient(45deg, #ff5555, #dd3939);
}

.thank-you-message {
  font-family: 'Press Start 2P', Arial, sans-serif;
  font-size: 48px;
  text-align: center;
  margin-top: 40px;
  animation: thankYouGlow 2s infinite alternate;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 
    0 0 10px #4ae257,
    0 0 20px #4ae257,
    0 0 30px #4ae257,
    0 0 40px #4ae257;
}

@keyframes thankYouGlow {
  from {
    text-shadow: 
      0 0 10px #4ae257,
      0 0 20px #4ae257,
      0 0 30px #4ae257,
      0 0 40px #4ae257;
  }
  to {
    text-shadow: 
      0 0 15px #4ae257,
      0 0 25px #4ae257,
      0 0 35px #4ae257,
      0 0 45px #4ae257,
      0 0 55px #4ae257;
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: scale(0.8);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes buttonGlow {
  0% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
                0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
                0 0 30px rgba(255, 255, 255, 0.2);
  }
  100% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
                0 0 20px rgba(255, 255, 255, 0.1);
  }
}

.action-button {
  animation: buttonGlow 2s infinite;
}
</style>