<template>
  <div class="login-container">
    <form @submit.prevent="login" class="login-form">
      <h2 class="login-title">Bienvenido a SITS</h2>
      
      <div class="form-group">
        <input
          v-model="username"
          type="text"
          placeholder="Usuario"
          class="input-field"
          :class="{'input-error': error}"
        />
      </div>
      
      <div class="form-group">
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="input-field"
          :class="{'input-error': error}"
        />
      </div>
      
      <button type="submit" :disabled="loading" class="submit-button">
        {{ loading ? 'Ingresando...' : 'Entrar' }}
      </button>
      
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
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
    sessionStorage.setItem('token', res.token)
    router.push('/page')  // Ruta protegida
  } catch (e) {
    error.value = 'Usuario o contraseña incorrectos'
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
  background-image: url('/assets/fondo2.png');  /* Aquí se aplica la imagen de fondo */
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
  border-color: red;
}

.submit-button {
  width: 100%;
  padding: 0.8rem;
  border: none;
  background-color: #007BFF;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #cccccc;
}

.error-message {
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 1rem;
}
</style>
