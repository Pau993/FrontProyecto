import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Entity } from './Entity'

// Mock global Image para tests de Node
global.Image = class {
  constructor() { this.src = ''; setTimeout(() => { if (this.onload) this.onload(); }, 0); }
}

describe('Entity', () => {
  let entity

  beforeEach(() => {
    entity = new Entity()
  })

  it('inicializa las propiedades correctamente', () => {
    expect(entity.x).toBe(0)
    expect(entity.y).toBe(0)
    expect(entity.speed).toBe(0)
    expect(entity.direction).toBe('down')
    expect(entity.collisionOn).toBe(false)
    expect(entity.solidArea).toEqual({ x: 0, y: 0, width: 48, height: 48 })
    expect(entity.solidAreaDefaultX).toBe(0)
    expect(entity.solidAreaDefaultY).toBe(0)
    expect(entity.images.up).toBe(null)
    expect(entity.imagesLoaded).toBe(false)
  })

  it('loadImage asigna una imagen al key y resuelve', async () => {
    // El mock de Image simula carga instantánea y llama onload
    await entity.loadImage('up', '/some/path.png')
    expect(entity.images.up).toBeInstanceOf(Image)
    expect(entity.images.up.src).toBe('/some/path.png')
  })

  it('draw NO llama drawImage si no hay imagen para la dirección', () => {
    const ctx = { drawImage: vi.fn() }
    entity.direction = 'up'
    entity.images.up = null
    entity.draw(ctx, 32)
    expect(ctx.drawImage).not.toHaveBeenCalled()
  })

  it('draw SÍ llama drawImage si hay imagen para la dirección', () => {
    const ctx = { drawImage: vi.fn() }
    entity.direction = 'left'
    const imgMock = new Image()
    entity.images.left = imgMock
    entity.x = 15
    entity.y = 20
    entity.draw(ctx, 40)
    expect(ctx.drawImage).toHaveBeenCalledWith(imgMock, 15, 20, 40, 40)
  })

  it('permite cambiar dirección, velocidad y área sólida', () => {
    entity.direction = 'right'
    entity.speed = 10
    entity.solidArea.x = 5
    entity.solidArea.y = 7
    expect(entity.direction).toBe('right')
    expect(entity.speed).toBe(10)
    expect(entity.solidArea.x).toBe(5)
    expect(entity.solidArea.y).toBe(7)
  })
})