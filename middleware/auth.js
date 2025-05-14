import jwtDecode from 'jwt-decode'
export default defineNuxtRouteMiddleware(() => {
  console.log('Middleware auth ejecutándose...')
  const token = sessionStorage.getItem('token')
  console.log('Token en sessionStorage:', token)
  if (!token) {
    console.log('No token encontrado, redirigiendo a login')
    return navigateTo('/login')
  }
  try {
    const decoded = jwtDecode(token)
    console.log('Token decodificado:', decoded)
    if (decoded.exp * 1000 < Date.now()) {
      console.log('Token expirado, borrando y redirigiendo a login')
      sessionStorage.removeItem('token')
      return navigateTo('/login')
    }
  } catch (e) {
    console.log('Error decodificando token:', e)
    sessionStorage.removeItem('token')
    return navigateTo('/login')
  }
})
