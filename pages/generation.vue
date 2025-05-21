<template>
  <div class="generation-page">
    <div class="content">
      <h1>Bienvenido</h1>
      <p>Ingresa tu nombre para comenzar:</p>
      <input v-model="playerName" type="text" placeholder="Tu nombre" />
      <button v-if="!playerId" @click="generatePlayerPlate">Generar Placa</button>
      <div v-if="playerId" class="plate-info">
        <p class="license-plate">Tu placa se verá reflejada en la pantalla principal</p>
        <button @click="startGame">Jugar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { WebSocketService } from '~/utils/WebSocketService'

const router = useRouter()
const playerName = ref('')
const { getWebSocket } = useWebSocket()
const webSocket = getWebSocket()
const playerId = ref('')

function generatePlayerPlate() {
  if (!playerName.value.trim()) {
    alert('Por favor, ingresa tu nombre.')
    return
  }

  // Set up callback before connecting
  webSocket.setPlayerIdCallback((receivedPlate) => {
    console.log('🎯 Received plate from server:', receivedPlate)
    // Update the playerId ref which will update the display
    playerId.value = receivedPlate
    // Store in localStorage
    localStorage.setItem('playerName', playerName.value)
    localStorage.setItem('licensePlate', receivedPlate)
    // Update WebSocket service
    webSocket.setPlayerInfo(playerName.value, receivedPlate)
  })

  // Connect to WebSocket to receive the plate
  if (!webSocket.isConnected) {
    webSocket.connect()
  }
}

function startGame() {
  router.push('/page')
}

onUnmounted(() => {
  if (webSocket.isConnected) {
    webSocket.disconnect()
  }
})
</script>

<style scoped>
.generation-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: url('/assets/fondo3.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 10px;
}

input {
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: none;
  width: 200px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #44c767;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  min-width: 150px;
}

button:hover {
  background-color: #38a055;
  transform: scale(1.05);
}

h1 {
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 1rem;
}

p {
  margin: 0.5rem 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.plate-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.license-plate {
  font-size: 1.5rem;
  font-weight: bold;
  color: #44c767;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  border: 2px solid #44c767;
}
</style>
