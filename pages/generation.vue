<template>
  <div class="generation-page">
    <div class="content-container">
      <h1 class="title">Bienvenido</h1>
      <p class="subtitle">Ingresa tu nombre para comenzar:</p>
      <input v-model="playerName" type="text" placeholder="Tu nombre" class="input-field" />
      
      <!-- Botón de generar placa -->
      <button v-if="!licensePlate" @click="generatePlayerPlate" class="generate-button">
        Generar Placa
      </button>

      <!-- Mostrar placa y botón de play -->
      <div v-if="licensePlate" class="plate-container">
        <p class="license-plate">Tu placa se a asignado correctamente, la verás reflejada en la pantalla del juego.</p>
        <button @click="startGame" class="play-button">Play</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const playerName = ref('')
const licensePlate = ref('')

function generatePlate() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  let plate = ''
  
  // Generate 3 random letters
  for (let i = 0; i < 3; i++) {
    plate += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  
  // Add a dash
  plate += '-'
  
  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  return plate
}

function generatePlayerPlate() {
  if (!playerName.value.trim()) {
    alert('Por favor, ingresa tu nombre.')
    return
  }
  licensePlate.value = generatePlate()
}

function startGame() {
  localStorage.setItem('playerName', playerName.value)
  localStorage.setItem('licensePlate', licensePlate.value)
  router.push('/page')
}
</script>

<style scoped>
.generation-page {
  min-height: 100vh;
  background-image: url('/assets/fondo2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.content-container {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  backdrop-filter: blur(5px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.title {
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.subtitle {
  color: #ffffff;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border-radius: 8px;
  border: 2px solid #44c767;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #38a055;
  box-shadow: 0 0 8px rgba(68, 199, 103, 0.5);
}

.play-button {
  padding: 12px 30px;
  background-color: #44c767;
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

.play-button:hover {
  background-color: #38a055;
  transform: scale(1.05);
}

.generate-button {
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

.generate-button:hover {
  background-color: #63c58c;
  transform: scale(1.05);
}

.plate-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.license-plate {
  color: #44c767;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>