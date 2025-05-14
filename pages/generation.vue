<template>
  <div class="generation-page">
    <h1>Bienvenido</h1>
    <p>Ingresa tu nombre para comenzar:</p>
    <input v-model="playerName" type="text" placeholder="Tu nombre" />
    <button @click="startGame">Play</button>
    <p v-if="licensePlate">Tu placa: {{ licensePlate }}</p>
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
  const letters = Array(3)
    .fill()
    .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    .join('')
  const numbers = Math.floor(100 + Math.random() * 900)
  return `${letters}${numbers}`
}

function startGame() {
  if (!playerName.value.trim()) {
    alert('Por favor, ingresa tu nombre.')
    return
  }

  licensePlate.value = generatePlate()

  localStorage.setItem('playerName', playerName.value)
  localStorage.setItem('licensePlate', licensePlate.value)

  router.push('/page')
}
</script>

<style scoped>
.generation-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #222;
  color: white;
}

input {
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: none;
}

button {
  padding: 10px 20px;
  background-color: #44c767;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #38a055;
}
</style>