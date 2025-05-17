<template>
  <div class="login-container">
    <form @submit.prevent="login" class="login-form">
      <h2 class="login-title">Bienvenido a SITS</h2>
      <p class="login-subtitle">Por favor ingresa usuario y contraseña</p>

      <div class="form-group">
        <input v-model="username" type="text" placeholder="Usuario" class="input-field"
          :class="{ 'input-error': error }" autocomplete="username" />
      </div>

      <div class="form-group">
        <input v-model="password" type="password" placeholder="Contraseña" class="input-field"
          :class="{ 'input-error': error }" autocomplete="current-password" />
      </div>

      <button type="submit" :disabled="loading || retryAfter > 0" class="submit-button">
        {{ loading ? 'Ingresando...' : 'Entrar' }}
      </button>

      <!-- Mensajes de error -->
      <p v-if="error" class="error-message">{{ error }}</p>


      <p v-if="retryAfter === 0 && attemptsLeft >= 0" class="info-message">
        Intentos restantes: {{ attemptsLeft }}
      </p>


    </form>

    <div v-if="retryAfter > 0" class="modal-overlay">
      <div class="modal-content">
        <p>Demasiados intentos fallidos. Intenta de nuevo en {{ retryAfter }} segundos.</p>
        <button @click="closePopup">Cerrar</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import jwtDecode from 'jwt-decode'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const showPopup = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const retryAfter = ref(0)  // segundos restantes para desbloquear
const attemptsLeft = ref(3) // intentos restantes (iniciales)

const startTimer = () => {
  if (retryAfter.value > 0) {
    showPopup.value = true
    const interval = setInterval(() => {
      retryAfter.value--
      if (retryAfter.value <= 0) {
        clearInterval(interval)
        showPopup.value = false
        attemptsLeft.value = 3 // restablecer intentos
        error.value = '' // limpiar error
      }
    }, 1000)
  }
}

const closePopup = () => {
  showPopup.value = false
  error.value = ''
}

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch('http://localhost:8080/api/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    sessionStorage.setItem('token', res.token)

    const decoden = jwtDecode(res.token)
    console.log('Token identificado', decoden)

    if (decoden.role === 'admin') {
      router.push('/view')  // Ruta protegida para admin
    } else {
      router.push('/generation')
    }
  } catch (e) {
    if (e.status === 429) {
      const data = e.response.json()
      error.value = `Demasiados intentos fallidos. Intenta de nuevo cuando termine el tiempo de espera.`
      retryAfter.value = data.retryAfter || 60
      attemptsLeft.value = data.attemptsLeft ?? 0
      startTimer()
    } else if (e.status === 401) {
      error.value = 'Usuario o contraseña incorrectos.'

      if (attemptsLeft.value > 0) attemptsLeft.value--
    } else {
      error.value = 'Error al iniciar sesión. Intenta de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('/assets/fondo2.png');
  background-size: cover;
  background-position: center;
}

.login-form {
  background: rgb(219, 39, 39);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.login-subtitle {
  text-align: center;
  font-size: 16px;
  margin-bottom: 1.5rem;
  font-weight: 400;
  color: #ffffff;
}

.form-group {
  margin-bottom: 1rem;
}

.input-field {
  width: 94%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #000000;
}

.input-error {
  border-color: rgb(255, 255, 255);
}

.submit-button {
  width: 100%;
  padding: 0.8rem;
  border: none;
  background-color: #7de03b;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #cccccc;
}

.error-message {
  color: rgb(255, 255, 255);
  font-size: 14px;
  text-align: center;
  margin-top: 1rem;
}

.info-message {
  color: white;
  text-align: center;
  margin-top: 0.8rem;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>
