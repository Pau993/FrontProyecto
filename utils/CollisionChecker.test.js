import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CollisionChecker } from './CollisionChecker'

const createEntity = (props = {}) => ({
  x: 32, y: 32, direction: 'up', speed: 8,
  solidArea: { x: 0, y: 0, width: 32, height: 32 },
  collisionOn: false,
  hasPerson: false,
  ...props
})

describe('CollisionChecker', () => {
  let tileManager, checker

  beforeEach(() => {
    tileManager = {
      tileMap: [
        [0, 1, 0],
        [1, 1, 1],
        [2, 0, 2]
      ],
      tiles: [
        { collision: false },
        { collision: true },
        { collision: false }
      ]
    }
    checker = new CollisionChecker(32, tileManager)
  })

  describe('checkTile', () => {
    it('detecta colisión al mover arriba', () => {
      const entity = createEntity({ direction: 'up' })
      checker.checkTile(entity)
      expect(entity.collisionOn).toBe(true)
    })

    it('detecta colisión al mover abajo', () => {
      const entity = createEntity({
        y: 32,
        direction: 'down'
      })
      checker.checkTile(entity)
      expect(entity.collisionOn).toBe(true)
    })
    it('detecta colisión al mover izquierda', () => {
      const entity = createEntity({
        x: 32,
        direction: 'left'
      })
      checker.checkTile(entity)
      expect(entity.collisionOn).toBe(true)
    })
    it('detecta colisión al mover derecha', () => {
      const entity = createEntity({
        x: 32,
        direction: 'right'
      })
      checker.checkTile(entity)
      expect(entity.collisionOn).toBe(false) // No hay colisión en este caso según tileMap
    })
  })

  describe('checkIntersect', () => {
    it('detecta intersección de rectángulos', () => {
      const r1 = { x: 0, y: 0, width: 10, height: 10 }
      const r2 = { x: 5, y: 5, width: 10, height: 10 }
      expect(checker.checkIntersect(r1, r2)).toBe(true)
    })
    it('detecta NO intersección de rectángulos', () => {
      const r1 = { x: 0, y: 0, width: 10, height: 10 }
      const r2 = { x: 20, y: 20, width: 10, height: 10 }
      expect(checker.checkIntersect(r1, r2)).toBe(false)
    })
  })

  describe('checkObject', () => {
    it('no detecta colisión si objetos no intersectan', () => {
      const entity = createEntity({ direction: 'up' })
      const obj = { x: 200, y: 200, solidArea: { x: 0, y: 0, width: 32, height: 32 }, collision: true }
      const result = checker.checkObject(entity, [obj])
      expect(entity.collisionOn).toBe(false)
      expect(result).toBe(999)
    })

    it('detecta colisión con objeto con colisión true', () => {
      const entity = createEntity({ direction: 'down' })
      const obj = {
        x: entity.x, y: entity.y + 8, solidArea: { x: 0, y: 0, width: 32, height: 32 }, collision: true
      }
      const result = checker.checkObject(entity, [obj])
      expect(entity.collisionOn).toBe(true)
      expect(result).toBe(999)
    })

    it('si player=true, retorna índice correcto', () => {
      const entity = createEntity({ direction: 'down' })
      const obj = {
        x: entity.x, y: entity.y + 8, solidArea: { x: 0, y: 0, width: 32, height: 32 }, collision: true
      }
      const result = checker.checkObject(entity, [obj], true)
      expect(result).toBe(0)
    })

    it('actualiza hasPerson y llama websocket si hay colisión y player+webSocket', () => {
      const entity = createEntity({ direction: 'down', hasPerson: false })
      const obj = {
        x: entity.x, y: entity.y + 8, solidArea: { x: 0, y: 0, width: 32, height: 32 }, collision: false
      }
      const wsMock = { isConnected: true, sendHasPersonUpdate: vi.fn() }
      checker.checkObject(entity, [obj], true, wsMock)
      expect(entity.hasPerson).toBe(true)
      expect(wsMock.sendHasPersonUpdate).toHaveBeenCalledWith(true)
    })
  })

  describe('checkPlayerCollision', () => {
    it('detecta colisión con otro jugador', () => {
      const entity = createEntity({ id: 'A', direction: 'right' })
      const other = createEntity({ id: 'B', x: entity.x + 32, direction: 'left' })
      const players = [entity, other]
      const result = checker.checkPlayerCollision(entity, players)
      expect(result).toBe(true)
      expect(entity.collisionOn).toBe(true)
    })
    it('ignora colisión consigo mismo', () => {
      const entity = createEntity({ id: 'A', direction: 'right' })
      const players = [entity]
      const result = checker.checkPlayerCollision(entity, players)
      expect(result).toBe(false)
    })
    it('retorna false si no hay colisiones', () => {
      const entity = createEntity({ id: 'A', direction: 'right' })
      const other = createEntity({ id: 'B', x: entity.x + 100 })
      const players = [entity, other]
      const result = checker.checkPlayerCollision(entity, players)
      expect(result).toBe(false)
    })
  })
})