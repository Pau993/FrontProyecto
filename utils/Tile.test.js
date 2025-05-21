import { describe, it, expect, beforeEach } from 'vitest'
import { Tile } from './Tile'

// Mock global Image para Node/tests
global.Image = class {
  constructor() {
    this.src = ''
    setTimeout(() => { if (this.onload) this.onload(); }, 0)
  }
}

describe('Tile', () => {
  let tile

  beforeEach(() => {
    tile = new Tile()
  })

  it('inicializa las propiedades correctamente', () => {
    expect(tile.image).toBe(null)
    expect(tile.collision).toBe(false)
  })

  it('loadImage asigna la imagen y resuelve', async () => {
    await tile.loadImage('/tiles/grass.png')
    expect(tile.image).toBeInstanceOf(Image)
    expect(tile.image.src).toBe('/tiles/grass.png')
  })
})