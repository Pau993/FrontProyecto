<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>


<template>
  <div style="text-align: center; margin-top: 50px;">
    <h2>No tienes permiso para acceder a esta página.</h2>
    <router-link to="/login">Volver al login</router-link>
  </div>
</template>
