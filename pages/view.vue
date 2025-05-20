
<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { WebSocketService } from '~/services/websocketService'

const players = ref([])
const playersCount = ref(0)

const wsUrl = 'ws://localhost:8080/game' 
const username = 'admin' 
const role = 'admin'

const wsService = new WebSocketService(wsUrl, username, role)

onMounted(() => {
  wsService.connect()

  wsService.connect()
  wsService.addListener((data) => {
    if (data.type === 'playersInfo') {
      playersCount.value = data.count || 0
      players.value = data.players || []
    }
  })
})

onBeforeUnmount(() => {
  wsService.disconnect()
})


</script>
<template>
  <div class="admin-panel">
    <h2>Panel Admin</h2>
    <p>Jugadores conectados: <strong>{{ playersCount }}</strong></p>
    <div v-if="players.length">
      <h3>Jugadores actuales:</h3>
      <ul class="players-list">
        <li v-for="player in players" :key="player.plate" class="player-item">
          <span class="plate">{{ player.plate }}</span> - <span class="name">{{ player.name }}</span>
        </li>
      </ul>
    </div>
    <p v-else>No hay jugadores conectados</p>
  </div>
</template>

<style scoped>
.admin-panel {
  max-width: 500px;
  margin: 40px auto;
  padding: 1.5rem;
  background-color: #1f2937;
  border-radius: 8px;
  color: #f9fafb;
  font-family: Arial, sans-serif;
  text-align: center;
  box-shadow: 0 0 15px rgba(0,0,0,0.3);
}

h2 {
  margin-bottom: 0.5rem;
}

h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.players-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 320px;
  text-align: left;
}

.player-item {
  background: #374151;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  font-weight: 500;
}

.plate {
  font-family: monospace;
  color: #fbbf24;
}

.name {
  color: #a5b4fc;
}
</style>