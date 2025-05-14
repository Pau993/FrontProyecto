export default defineNuxtRouteMiddleware(() => {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true'
  
  if (!isAuthenticated) {
    return navigateTo('/login')  // Redirigir a login si no está autenticado
  }
})
