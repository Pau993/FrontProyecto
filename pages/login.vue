<template>
  <form @submit.prevent="login">
    <input v-model="username" placeholder="Usuario" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button type="submit" :disabled="loading">{{ loading ? 'Ingresando...' : 'Entrar' }}</button>
    <p v-if="error" style="color:red">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch('http://localhost:8080/api/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    console.log('Token recibido:', res.token)
    localStorage.setItem('token', res.token)
    console.log('Antes de router.push')
    await router.push('/page')
    console.log('Después de router.push')  // Si no aparece, router.push no se completó
  } catch (e) {
    error.value = 'Usuario o contraseña incorrectos'
    console.error('Error login:', e)
  } finally {
    loading.value = false
  }
}

</script>
