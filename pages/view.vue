
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <div style="text-align: center; margin-top: 50px;">
    <h2>PAGINA DEL ADMIN</h2>
    <router-link to="/login">Volver al login</router-link>
  </div>
</template>
