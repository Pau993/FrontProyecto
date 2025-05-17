
export class WebSocketService {
  constructor(url, username = 'guest', role = 'user') {
    this.url = url
    this.username = username
    this.role = role
    this.ws = null
    this.listeners = []
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket Connected')
      // Enviar información de usuario al conectar
      this.ws.send(JSON.stringify({
        username: this.username,
        role: this.role
      }))
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('WebSocket received message:', data)
      this.listeners.forEach(fn => fn(data))
    }

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected')
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error)
    }
  }

  addListener(fn) {
    this.listeners.push(fn)
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
