import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PlayersManager } from './PlayersManager'

// Mock Player
vi.mock('./Player', () => ({
  Player: class {
    constructor(w, h, t, id) {
      this.x = 0
      this.y = 0
      this.direction = 'down'
      this.hasPerson = 0
      this.isLocalPlayer = false
      this.loadImages = vi.fn(async () => { this.imagesLoaded = true })
      this.draw = vi.fn()
    }
  }
}))

import { Player } from './Player'

describe('PlayersManager', () => {
  let mgr

  beforeEach(() => {
    mgr = new PlayersManager(800, 600, 32)
  })

  it('inicializa correctamente', () => {
    expect(mgr.players).toBeInstanceOf(Map)
    expect(mgr.SCREEN_WIDTH).toBe(800)
    expect(mgr.SCREEN_HEIGHT).toBe(600)
    expect(mgr.TILE_SIZE).toBe(32)
    expect(mgr.localPlayerId).toBe(null)
  })

  it('addPlayer agrega y configura un jugador', () => {
    const p = mgr.addPlayer('a1', 100, 200, 'left', 3)
    expect(mgr.players.has('a1')).toBe(true)
    expect(p.x).toBe(100)
    expect(p.y).toBe(200)
    expect(p.direction).toBe('left')
    expect(p.hasPerson).toBe(3)
    expect(p.isLocalPlayer).toBe(false)
  })

  it('addPlayer marca isLocalPlayer si el id coincide', () => {
    mgr.localPlayerId = 'id2'
    const p = mgr.addPlayer('id2', 1, 2, 'up', 1)
    expect(p.isLocalPlayer).toBe(true)
  })

  it('removePlayer elimina correctamente', () => {
    mgr.addPlayer('a2', 1, 1, 'down', 0)
    mgr.removePlayer('a2')
    expect(mgr.players.has('a2')).toBe(false)
  })

  it('updatePlayerPosition modifica si existe', () => {
    mgr.addPlayer('bb', 1, 1, 'down', 0)
    mgr.updatePlayerPosition('bb', 5, 6, 'right', 8)
    const p = mgr.players.get('bb')
    expect(p.x).toBe(5)
    expect(p.y).toBe(6)
    expect(p.direction).toBe('right')
    expect(p.hasPerson).toBe(8)
  })

  it('updatePlayerPosition ignora si no existe el player', () => {
    expect(() => mgr.updatePlayerPosition('notfound', 1, 2, 'up', 1)).not.toThrow()
  })

  it('getLocalPlayer retorna el jugador local (si existe)', () => {
    mgr.localPlayerId = 'player1'
    mgr.addPlayer('player1', 10, 10, 'down', 0)
    const found = mgr.getLocalPlayer()
    expect(found).toBeDefined()
    expect(found.x).toBe(10)
  })

  it('getLocalPlayer retorna undefined si localPlayerId no está', () => {
    expect(mgr.getLocalPlayer()).toBeUndefined()
  })

  it('loadAllPlayersImages llama loadImages en todos', async () => {
    mgr.addPlayer('x', 5, 6, 'left', 0)
    mgr.addPlayer('y', 7, 8, 'right', 0)
    await mgr.loadAllPlayersImages()
    for (const p of mgr.players.values()) {
      expect(p.loadImages).toHaveBeenCalled()
      expect(p.imagesLoaded).toBe(true)
    }
  })

  it('drawAll llama draw en todos los jugadores', () => {
    mgr.addPlayer('x', 1, 1, 'down', 0)
    mgr.addPlayer('y', 1, 1, 'right', 0)
    const ctx = {}
    mgr.drawAll(ctx)
    for (const p of mgr.players.values()) {
      expect(p.draw).toHaveBeenCalledWith(ctx)
    }
  })
})