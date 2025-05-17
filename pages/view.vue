
<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { WebSocketService } from '~/services/websocketService'

const playersCount = ref(0)

const wsUrl = 'ws://localhost:8080/game'  // Mismo endpoint, sin roles en URL
const username = 'admin'  // Solo para enviar en conexión, puede ser dinámico si quieres
const role = 'admin'

const wsService = new WebSocketService(wsUrl, username, role)

onMounted(() => {
  wsService.connect()

  wsService.addListener((data) => {
    if (data.type === 'playersCount') {
      playersCount.value = data.count
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
  </div>
</template>