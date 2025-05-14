<template>
  <div>
    <h1>Iniciar sesión</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Nombre de usuario</label>
        <input v-model="username" type="text" id="username" placeholder="Usuario" required />
      </div>

      <div>
        <label for="password">Contraseña</label>
        <input v-model="password" type="password" id="password" placeholder="Contraseña" required />
      </div>

      <button type="submit">Iniciar sesión</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const username = ref('')
const password = ref('')
const message = ref('')
const users = ref([])

// Función para cargar los usuarios desde el archivo JSON
const loadUsers = async () => {
  const res = await fetch('/users.json') // Cargar el archivo JSON
  const data = await res.json() // Convertirlo a objeto JS
  users.value = data.users // Asignar los usuarios a la variable
}

// Función para manejar el inicio de sesión
const handleLogin = async () => {
  const user = users.value.find(u => u.username === username.value)

  if (!user) {
    message.value = 'Usuario no encontrado'
    return
  }

  // Comparar la contraseña directamente (sin cifrar)
  if (password.value === user.password) {
    message.value = 'Inicio de sesión exitoso'
    localStorage.setItem('authenticated', 'true')
    const router = useRouter() // Obtenemos el router
    router.push('/page') // Redirigir al juego

  } else {
    message.value = 'Contraseña incorrecta'
  }
}

// Cargar los usuarios cuando el componente se monte
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Estilos para la página de login */
</style>
