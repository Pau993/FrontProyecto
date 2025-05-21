import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Player } from './Player'

// Mock de global Image para Node/tests
global.Image = class {
  constructor() {
    this.src = ''
    setTimeout(() => { if (this.onload) this.onload(); }, 0)
  }
}

describe('Player', () => {
  let player
  const width = 400, height = 300, tileSize = 32

  beforeEach(() => {
    player = new Player(width, height, tileSize, 'testId')
  })

  it('inicializa propiedades correctamente', () => {
    expect(player.name).toBe('Player-testId')
    expect(player.x).toBe(100)
    expect(player.y).toBe(100)
    expect(player.hasPerson).toBe(0)
    expect(player.isLocal).toBe(false)
    expect(player.solidArea).toEqual({ x: 10, y: 10, width: 45, height: 60 })
    expect(typeof player.loadImages).toBe('function')
    expect(typeof player.draw).toBe('function')
  })

  it('getCurrentImage regresa null si no hay imágenes cargadas', () => {
    player.images = undefined
    expect(player.getCurrentImage()).toBe(null)
  })

  it('getCurrentImage toma la key correcta por dirección y hasPerson', () => {
    player.images = {
      right: { val: 'base' }, rightLoaded: { val: 'lvl1' }, rightLoadedTwo: { val: 'lvl2' }
    }
    player.direction = 'right'
    player.hasPerson = 1
    expect(player.getCurrentImage().val).toBe('base')
    player.hasPerson = 3
    expect(player.getCurrentImage().val).toBe('lvl1')
    player.hasPerson = 5
    expect(player.getCurrentImage().val).toBe('lvl2')
  })

  it('loadImages asigna las imágenes y marca loaded', async () => {
    await player.loadImages()
    expect(player.imagesLoaded).toBe(true)
    // Todas las keys base deben existir
    expect(player.images.up).toBeInstanceOf(Image)
    expect(player.images.downLoaded).toBeInstanceOf(Image)
  })

  it('draw salta si no hay imagen cargada', async () => {
    const ctx = {
      save: vi.fn(), restore: vi.fn(),
      drawImage: vi.fn(), fillText: vi.fn(), fillRect: vi.fn(), measureText: () => ({ width: 10 }),
      beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), strokeRect: vi.fn(),
      font: '', fillStyle: '', textAlign: '', strokeStyle: ''
    }
    player.imagesLoaded = false
    player.draw(ctx)
    expect(ctx.drawImage).not.toHaveBeenCalled()
    // Fuerza imagen
    await player.loadImages()
    player.imagesLoaded = true
    player.direction = 'down'
    player.images.down = new Image()
    player.hasPerson = 0
    player.isLocal = true
    player.draw(ctx)
    expect(ctx.drawImage).toHaveBeenCalled()
  })

  it('draw llama a drawPersonCount si hasPerson > 0', async () => {
    const ctx = {
      save: vi.fn(), restore: vi.fn(),
      drawImage: vi.fn(), fillText: vi.fn(), fillRect: vi.fn(), measureText: () => ({ width: 10 }),
      beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), strokeRect: vi.fn(),
      font: '', fillStyle: '', textAlign: '', strokeStyle: ''
    }
    player.imagesLoaded = true
    player.hasPerson = 2
    player.direction = 'right'
    player.images.right = new Image()
    player.drawPersonCount = vi.fn()
    player.draw(ctx)
    expect(player.drawPersonCount).toHaveBeenCalled()
  })

  it('getNetworkState retorna objeto coherente', () => {
    const state = player.getNetworkState()
    expect(state).toHaveProperty('id', 'testId')
    expect(state).toHaveProperty('name', 'Player-testId')
    expect(typeof state.timestamp).toBe('number')
  })

  it('updateFromNetwork (positions) modifica posición, dirección y hasPerson', () => {
    const d = {
      type: 'positions',
      players: {
        testId: { x: 21.1, y: 22.2, direction: 'up', hasPerson: 7 }
      }
    }
    player.isLocal = false
    player.updateFromNetwork(d)
    expect(player.x).not.toBe(100)
    expect(player.hasPerson).toBe(7)
    expect(player.direction).toBe('up')
  })

  it('pickUpObject suma pasajeros si hay persona activa', () => {
    const obj = { name: 'person', id: 'per1', active: true }
    const ws = { sendHasPersonUpdate: vi.fn(), sendPersonState: vi.fn() }
    const objs = [obj]
    player.pickUpObject(0, objs, ws)
    expect(player.hasPerson).toBe(1)
    expect(obj.active).toBe(false)
    expect(ws.sendHasPersonUpdate).toHaveBeenCalledWith(1)
    setTimeout(() => {
      expect(obj.active).toBe(true)
      expect(ws.sendPersonState).toHaveBeenCalledWith('per1', true)
    }, 5005)
  })

  it('pickUpObject resta pasajeros si hay obstáculo', () => {
    player.hasPerson = 6
    const obj = { name: 'obstacles', id: 'ob1', active: true }
    const ws = { sendHasPersonUpdate: vi.fn() }
    const objs = [obj]
    player.pickUpObject(0, objs, ws)
    expect(player.hasPerson).toBe(3)
    expect(ws.sendHasPersonUpdate).toHaveBeenCalledWith(3)
  })

  it('update keys mueve player y controla límites', () => {
    player.isLocal = true
    const keys = { up: true }; // solo up activa
    const colChecker = { checkTile: vi.fn(), checkObject: vi.fn().mockReturnValue(999) }
    player.x = 0
    player.y = 0
    player.update(keys, colChecker, [], null, [])
    expect(player.direction).toBe('up')
    expect(player.x).toBe(0)
    expect(player.y).toBe(0) // por min 0
  })

  it('checkPlayerCollision detecta colisión con otro jugador y rebote', () => {
    player.hasPerson = 7
    player.isInCollision = false
    player.x = 10
    player.y = 10
    const other = new Player(width, height, tileSize, 'other')
    other.x = player.x + 10
    other.y = player.y + 10
    other.solidArea = { x: 10, y: 10, width: 45, height: 60 }
    const ws = { sendHasPersonUpdate: vi.fn() }
    player.checkPlayerCollision([other], ws)
    expect(player.hasPerson).toBe(4)
    expect(player.isInCollision).toBe(true)
    expect(ws.sendHasPersonUpdate).toHaveBeenCalledWith(4)
  })

})