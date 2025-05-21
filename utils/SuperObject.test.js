import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SuperObject } from './SuperObject'

// Mock global Image para Node/tests
global.Image = class {
  constructor() { this.src = '' }
}

describe('SuperObject', () => {
  let obj

  beforeEach(() => {
    obj = new SuperObject()
  })

  it('inicializa correctamente las propiedades', () => {
    expect(obj.name).toBe('')
    expect(obj.image).toBe(null)
    expect(obj.collision).toBe(false)
    expect(obj.x).toBe(0)
    expect(obj.y).toBe(0)
    expect(obj.scale).toBe(1)
  })

  it('draw NO hace nada si no hay imagen', () => {
    const ctx = { drawImage: vi.fn() }
    const gamePanel = { tileSize: 80 }
    obj.image = null
    obj.draw(ctx, gamePanel)
    expect(ctx.drawImage).not.toHaveBeenCalled()
  })

  it('draw llama a drawImage correctamente cuando hay imagen', () => {
    const ctx = { drawImage: vi.fn() }
    const gamePanel = { tileSize: 100 }
    obj.image = new Image()
    obj.x = 10
    obj.y = 20
    obj.draw(ctx, gamePanel)
    // Checa los parámetros
    const scaledSize = 100 * 0.7
    const offset = (100 - scaledSize) / 2
    expect(ctx.drawImage).toHaveBeenCalledWith(
      obj.image,
      obj.x + offset,
      obj.y + offset,
      scaledSize,
      scaledSize
    )
  })
})