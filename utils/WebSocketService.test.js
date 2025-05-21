import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebSocketService } from './WebSocketService'

// Mock del WebSocket global antes de crear las instancias
let socketEvents = {}
global.WebSocket = vi.fn(function (url) {
  this.url = url
  this.readyState = WebSocket.OPEN
  this.send = vi.fn()
  this.close = vi.fn()
  this.setOn = (ev, fn) => { this[`on${ev}`] = fn }
  // onopen, onmessage… las puedes setear así para tests
})
global.WebSocket.OPEN = 1
global.WebSocket.CLOSED = 3

describe('WebSocketService', () => {
  let ws

  beforeEach(() => {
    ws = new WebSocketService()
    socketEvents = {}
    global.WebSocket.mockClear()
  })

  it('inicializa las propiedades correctamente', () => {
    expect(ws.isConnected).toBe(false)
    expect(ws.connectionAttempts).toBe(0)
    expect(ws.pendingMessages).toEqual([])
    expect(ws.localPlayerId).toBe(null)
  })

  it('setLocalPlayerId y getLocalPlayerId funcionan', () => {
    ws.setLocalPlayerId('A1')
    expect(ws.getLocalPlayerId()).toBe('A1')
  })

  it('connect crea un socket, asigna handlers y manda playerJoin', () => {
    ws.sendPlayerData = vi.fn()
    ws.socket = null
    ws.connect()
    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080/game')
    // Simula apertura:
    ws.socket.onopen()
    expect(ws.isConnected).toBe(true)
    expect(ws.sendPlayerData).toHaveBeenCalled()
    expect(ws.connectionAttempts).toBe(0)
  })

  it('no reconecta si se alcanzan los intentos máximos', () => {
    ws.connectionAttempts = WebSocketService.MAX_RETRIES
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
    ws.connect()
    expect(global.WebSocket).not.toHaveBeenCalled()
    logError.mockRestore()
  })

  it('handleMessage llama onPlayersUpdate/personUpdate según type', () => {
    const cb = vi.fn()
    ws.onPlayersUpdate = cb
    ws.localPlayerId = 'myid'

    // positions update
    ws.handleMessage({ data: JSON.stringify({ type: 'positions', players: { a: { x: 1, y: 2, direction: 'up' } } }) })
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'playerUpdate', id: 'a', x: 1, y: 2, direction: 'up' })
    )

    // personUpdate for remote
    ws.handleMessage({ data: JSON.stringify({ type: 'personUpdate', playerId: 'remoteid', hasPerson: 5 }) })
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'playerUpdate', id: 'remoteid', hasPerson: 5 })
    )

    // personUpdate for local (should skip callback)
    ws.onPlayersUpdate = vi.fn()
    ws.handleMessage({ data: JSON.stringify({ type: 'personUpdate', playerId: 'myid', hasPerson: 9 }) })
    expect(ws.onPlayersUpdate).not.toHaveBeenCalled()
  })

  it('handleMessage maneja playerDisconnect', () => {
    const cb = vi.fn()
    ws.onPlayersUpdate = cb
    ws.handleMessage({ data: JSON.stringify({ type: 'playerDisconnect', id: 'z' }) })
    expect(cb).toHaveBeenCalledWith({ type: 'playerDisconnect', id: 'z' })
  })

  it('handleMessage llama onInitialData con availablePersons', () => {
    ws.onInitialData = vi.fn()
    ws.handleMessage({ data: JSON.stringify({ type: 'availablePersons', persons: { a: 1 } }) })
    expect(ws.onInitialData).toHaveBeenCalled()
  })

  it('sendPlayerData envia si conectado, si no queda en queue', () => {
    ws.socket = new WebSocket()
    ws.isConnected = true
    ws.socket.readyState = WebSocket.OPEN
    ws.socket.send = vi.fn()
    ws.sendPlayerData({ hola: 1 })
    expect(ws.socket.send).toHaveBeenCalled()
    ws.isConnected = false
    ws.socket.readyState = 0
    ws.sendPlayerData({ no: 5 })
    expect(ws.pendingMessages.length).toBe(1)
  })

  it('sendPlayerData maneja error en JSON/stringify', () => {
    ws.socket = { send: vi.fn() }
    ws.isConnected = true
    ws.socket.readyState = WebSocket.OPEN
    // Generar un objeto circular para que JSON falle
    const circular = {}
    circular.ref = circular
    ws.pendingMessages = []
    ws.handleReconnect = vi.fn()
    ws.sendPlayerData(circular)
    expect(ws.pendingMessages.length).toBe(1)
    expect(ws.handleReconnect).toHaveBeenCalled()
  })

  it('processQueuedMessages vacía la cola si conectado', () => {
    ws.socket = new WebSocket()
    ws.isConnected = true
    ws.socket.readyState = WebSocket.OPEN
    ws.socket.send = vi.fn()
    ws.pendingMessages = [{ a: 1 }, { b: 2 }]
    ws.sendPlayerData = vi.fn()
    ws.processQueuedMessages()
    expect(ws.sendPlayerData).toHaveBeenCalledTimes(2)
    expect(ws.pendingMessages.length).toBe(0)
  })

  it('sendHasPersonUpdate y sendPersonState llaman sendPlayerData', () => {
    ws.localPlayerId = 'pid'
    ws.sendPlayerData = vi.fn()
    ws.sendHasPersonUpdate(8)
    expect(ws.sendPlayerData).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'personUpdate', id: 'pid', hasPerson: '8' })
    )
    ws.sendPersonState('pr', true)
    expect(ws.sendPlayerData).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'personState', personId: 'pr', active: true })
    )
  })

  it('handleReconnect incrementa intentos y programa reconexión si aplica', () => {
    ws.connectionAttempts = 0
    const delaySpy = vi.spyOn(global, 'setTimeout').mockImplementation((fn) => { fn(); })
    ws.connect = vi.fn()
    ws.handleReconnect()
    expect(ws.connectionAttempts).toBe(1)
    expect(ws.connect).toHaveBeenCalled()
    delaySpy.mockRestore()
  })

  it('disconnect cierra socket y limpia estadoo', () => {
    ws.socket = new WebSocket()
    ws.isConnected = true
    ws.connectionAttempts = 1
    ws.disconnect()
    expect(ws.socket).toBe(null)
    expect(ws.isConnected).toBe(false)
    expect(ws.connectionAttempts).toBe(0)
  })
  // --- Test para handleMessage: error de JSON y formato inválido ---
it('handleMessage maneja error de JSON y message sin type', () => {
  const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
  // JSON inválido
  expect(() => ws.handleMessage({ data: '<<badjson>>' })).not.toThrow()
  // Mensaje sin "type"
  ws.handleMessage({ data: JSON.stringify({ some: 'random' }) })
  expect(logError).toHaveBeenCalled()
  logError.mockRestore()
})

// --- Test handleMessage: message.error ---
it('handleMessage maneja mensajes con error', () => {
  const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
  ws.handleMessage({ data: JSON.stringify({ error: 'fail!' }) })
  expect(logError).toHaveBeenCalledWith(' Server Error:', 'fail!')
  logError.mockRestore()
})

// --- Test: handleMessage: UNKNOWN type (default branch/warning) ---
it('handleMessage emite warning si type desconocido', () => {
  const logWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  ws.handleMessage({ data: JSON.stringify({ type: 'desconocido!' }) })
  expect(logWarn).toHaveBeenCalled()
  logWarn.mockRestore()
})

// --- Test: receiveWebSocketData asigna onmessage y llama handleMessage ---
it('receiveWebSocketData asigna correctamente onmessage', () => {
  ws.handleMessage = vi.fn()
  ws.socket = new WebSocket()
  ws.receiveWebSocketData()
  // Simula evento
  const fakeEvt = { data: JSON.stringify({ type: 'positions', players: {} }) }
  ws.socket.onmessage(fakeEvt)
  expect(ws.handleMessage).toHaveBeenCalledWith(fakeEvt)
})

// --- Test: connect cierra socket abierto antes de crear nuevo ---
it('connect cierra socket abierto con readyState !== CLOSED', () => {
  ws.socket = new WebSocket()
  ws.socket.readyState = 1 // Not CLOSED
  const oldSocket = ws.socket
  oldSocket.close = vi.fn()
  ws.connectionAttempts = 0
  ws.sendPlayerData = vi.fn()
  ws.connect()
  expect(oldSocket.close).toHaveBeenCalled()
})

// --- Test: handleClose actualiza estado y reconecta si código distinto a 1000 ---
it('handleClose actualiza isConnected y llama a handleReconnect', () => {
  ws.handleReconnect = vi.fn()
  ws.isConnected = true
  const evt = { code: 500 }
  ws.handleClose(evt)
  expect(ws.isConnected).toBe(false)
  expect(ws.handleReconnect).toHaveBeenCalled()
})

// --- Test: handleClose NO reconecta con código 1000 ---
it('handleClose solo desconecta si code=1000', () => {
  ws.handleReconnect = vi.fn()
  ws.isConnected = true
  const evt = { code: 1000 }
  ws.handleClose(evt)
  expect(ws.isConnected).toBe(false)
  expect(ws.handleReconnect).not.toHaveBeenCalled()
})

// --- Test: handleError actualiza isConnected y muestra error ---
it('handleError hace log de error y desconecta', () => {
  const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
  ws.isConnected = true
  ws.handleError('FATAL!')
  expect(logError).toHaveBeenCalledWith('WebSocket Error:', 'FATAL!')
  expect(ws.isConnected).toBe(false)
  logError.mockRestore()
})

// --- Test: setPlayersUpdateCallback y setInitialDataCallback asignan callback ---
it('setPlayersUpdateCallback y setInitialDataCallback asignan handlers', () => {
  const cb1 = () => {}
  const cb2 = () => {}
  ws.setPlayersUpdateCallback(cb1)
  ws.setInitialDataCallback(cb2)
  expect(ws.onPlayersUpdate).toBe(cb1)
  expect(ws.onInitialData).toBe(cb2)
})

// --- Test: processQueuedMessages NO llama sendPlayerData si la cola está vacía ---
it('processQueuedMessages funciona sin error si pendingMessages ya está vacía', () => {
  ws.sendPlayerData = vi.fn()
  ws.pendingMessages = []
  expect(() => ws.processQueuedMessages()).not.toThrow()
  expect(ws.sendPlayerData).not.toHaveBeenCalled()
})

// --- Test: sendPlayerPosition prepara bien los datos y llama sendPlayerData ---
it('sendPlayerPosition envía los datos correctos', () => {
  ws.sendPlayerData = vi.fn()
  ws.sendPlayerPosition({ id: 5, x: 1, y: 2, direction: 'left' })
  expect(ws.sendPlayerData).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'playerUpdate',
      id: 5,
      x: 1,
      y: 2,
      direction: 'left'
    })
  )
})
})