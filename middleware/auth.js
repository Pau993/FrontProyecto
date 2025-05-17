import jwtDecode from 'jwt-decode'

export default defineNuxtRouteMiddleware((to, from) => {
  console.log('Middleware auth ejecutándose...')
  const token = sessionStorage.getItem('token')

  // Si no hay token, redirige a login
  if (!token) {
    console.log('No token encontrado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  try {
    const decoded = jwtDecode(token)
    console.log('Token decodificado:', decoded)
    
    // Verifica si el token ha expirado
    if (decoded.exp * 1000 < Date.now()) {
      console.log('Token expirado, borrando y redirigiendo a login')
      sessionStorage.removeItem('token')
      return navigateTo('/login')
    }

    // Si el usuario no es admin y está intentando acceder a la página '/view', lo redirige a 'not-authorized'
    if (to.path === '/view' && decoded.role !== 'admin') {
      console.log('Acceso no autorizado a /view para el usuario, redirigiendo a /not-authorized')
      return navigateTo('/not-authorized')
    }

    // Si el admin intenta acceder a /page, lo redirige a /not-authorized
    if (to.path === '/page' && decoded.role === 'admin') {
      console.log('Acceso no autorizado a /page para admin, redirigiendo a /not-authorized')
      return navigateTo('/not-authorized')
    }

  } catch (e) {
    console.log('Error decodificando token:', e)
    sessionStorage.removeItem('token')
    return navigateTo('/login')
  }
})
