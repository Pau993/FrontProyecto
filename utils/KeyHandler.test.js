import { describe, it, expect, beforeEach, vi } from 'vitest'
import { KeyHandler } from './KeyHandler'

describe('KeyHandler', () => {
  let keyHandler
  let addEventListenerMock, removeEventListenerMock

  beforeEach(() => {
    // Simulación de window en node/tests
    global.window = {}
    addEventListenerMock = vi.fn()
    removeEventListenerMock = vi.fn()
    window.addEventListener = addEventListenerMock
    window.removeEventListener = removeEventListenerMock

    keyHandler = new KeyHandler()
  })

  it('inicializa correctamente las teclas', () => {
    expect(keyHandler.upPressed).toBe(false)
    expect(keyHandler.downPressed).toBe(false)
    expect(keyHandler.leftPressed).toBe(false)
    expect(keyHandler.rightPressed).toBe(false)
  })

  it('init agrega listeners a window', () => {
    keyHandler.init()
    expect(addEventListenerMock).toHaveBeenCalledWith('keydown', keyHandler.handleKeyDown)
    expect(addEventListenerMock).toHaveBeenCalledWith('keyup', keyHandler.handleKeyUp)
  })

  it('cleanup elimina listeners de window', () => {
    keyHandler.cleanup()
    expect(removeEventListenerMock).toHaveBeenCalledWith('keydown', keyHandler.handleKeyDown)
    expect(removeEventListenerMock).toHaveBeenCalledWith('keyup', keyHandler.handleKeyUp)
  })

  it('handleKeyDown activa la tecla correspondiente', () => {
    keyHandler.handleKeyDown({ key: 'w' })
    expect(keyHandler.upPressed).toBe(true)
    keyHandler.handleKeyDown({ key: 's' })
    expect(keyHandler.downPressed).toBe(true)
    keyHandler.handleKeyDown({ key: 'a' })
    expect(keyHandler.leftPressed).toBe(true)
    keyHandler.handleKeyDown({ key: 'd' })
    expect(keyHandler.rightPressed).toBe(true)
  })

  it('handleKeyDown ignora otras teclas', () => {
    keyHandler.handleKeyDown({ key: 'p' })
    expect(keyHandler.upPressed).toBe(false)
    expect(keyHandler.downPressed).toBe(false)
    expect(keyHandler.leftPressed).toBe(false)
    expect(keyHandler.rightPressed).toBe(false)
  })

  it('handleKeyUp desactiva la tecla correspondiente', () => {
    // Primero activar
    keyHandler.upPressed = true
    keyHandler.downPressed = true
    keyHandler.leftPressed = true
    keyHandler.rightPressed = true

    keyHandler.handleKeyUp({ key: 'w' })
    expect(keyHandler.upPressed).toBe(false)
    keyHandler.handleKeyUp({ key: 's' })
    expect(keyHandler.downPressed).toBe(false)
    keyHandler.handleKeyUp({ key: 'a' })
    expect(keyHandler.leftPressed).toBe(false)
    keyHandler.handleKeyUp({ key: 'd' })
    expect(keyHandler.rightPressed).toBe(false)
  })

  it('handleKeyUp ignora otras teclas', () => {
    keyHandler.upPressed = true
    keyHandler.handleKeyUp({ key: 'p' })
    expect(keyHandler.upPressed).toBe(true)
  })
})