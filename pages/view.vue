
<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { WebSocketService } from '~/services/websocketService'

const playersCount = ref(0)
const playersList = ref([]) 

const wsUrl = 'ws://localhost:8080/game'  // Mismo endpoint, sin roles en URL
const username = 'admin'  // Solo para enviar en conexión, puede ser dinámico si quieres
const role = 'admin'

const wsService = new WebSocketService(wsUrl, username, role)

onMounted(() => {
  wsService.connect()

  wsService.addListener((data) => {
    if (data.type === 'playersInfo') {
      playersCount.value = data.count
      playersList.value = data.players;
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
    <p class="count">Jugadores conectados: <strong>{{ playersCount }}</strong></p>

    <table v-if="playersList.length" class="players-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Placa</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in playersList" :key="player.plate">
          <td>{{ player.name }}</td>
          <td>{{ player.plate }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="no-players">No hay jugadores conectados.</p>
  </div>
</template>

<style scoped>
.admin-panel {
  max-width: 600px;
  margin: 2rem auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  background-color: #f9f9f9;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #34495e;
}

.count {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.players-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.players-table th,
.players-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

.players-table th {
  background-color: #3498db;
  color: white;
  font-weight: 600;
}

.players-table tr:nth-child(even) {
  background-color: #ecf0f1;
}

.no-players {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-top: 1rem;
}
</style>