
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
  <div style="text-align:center; margin-top:50px;">
    <h2>Panel Admin</h2>
    <p>Jugadores conectados: {{ playersCount }}</p>
    <p> PLacas : {{ playersList }}</p>
  </div>
</template>