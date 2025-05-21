import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TileManager } from './TileManager'

// Mock global Image para Node/tests
global.Image = class {
  constructor() { 
    this.src = '' 
    setTimeout(() => { if (this.onload) this.onload(); }, 0)
  }
}
vi.mock('./Tile', () => ({
  Tile: class {
    constructor() {
      this.image = null
      this.collision = false
    }
  }
}))
import { Tile } from './Tile'

describe('TileManager', () => {
  let tm

  beforeEach(() => {
    tm = new TileManager(3, 2, 32) // ejemplo: 3 columnas, 2 filas, tile 32x32
  })

  it('inicializa propiedades y arreglos', () => {
    expect(tm.maxScreenCol).toBe(3)
    expect(tm.maxScreenRow).toBe(2)
    expect(tm.tileSize).toBe(32)
    expect(Array.isArray(tm.tiles)).toBe(true)
    expect(Array.isArray(tm.tileMap)).toBe(true)
    expect(tm.tiles.length).toBeGreaterThanOrEqual(3)
    expect(tm.tileMap.length).toBe(3)
    expect(tm.tileMap[0].length).toBe(2)
  })

  it('loadTiles asigna imagen y colisión', async () => {
    await tm.loadTiles()
    // Por ejemplo, primer tile del config debe existir y tener imagen y colisión true
    expect(tm.tiles[0].image).toBeInstanceOf(Image)
    expect(tm.tiles[0].collision).toBe(true)
  })

  it('loadMap llena tileMap con los datos dados', async () => {
    const mapa = `
      0 1 2
      2 1 0
    `
    await tm.loadMap(mapa)
    expect(tm.tileMap[0][0]).toBe(0)
    expect(tm.tileMap[1][0]).toBe(1)
    expect(tm.tileMap[2][1]).toBe(0)
  })

  it('draw llama a drawImage solo en tiles con imagen', () => {
    // Prepara tiles e imágenes
    tm.tiles[1].image = new Image()
    tm.tileMap[1][1] = 1
    const ctx = { drawImage: vi.fn() }
    tm.draw(ctx)
    expect(ctx.drawImage).toHaveBeenCalledWith(
      tm.tiles[1].image,
      1 * tm.tileSize,
      1 * tm.tileSize,
      tm.tileSize,
      tm.tileSize
    )
  })

  it('getTileCollision retorna true si coordenadas fuera de rango', () => {
    expect(tm.getTileCollision(-1, 0)).toBe(true)
    expect(tm.getTileCollision(0, 9)).toBe(true)
    expect(tm.getTileCollision(9, 0)).toBe(true)
    expect(tm.getTileCollision(0, -1)).toBe(true)
  })

  it('getTileCollision retorna la propiedad collision correcta', () => {
    tm.tileMap[0][0] = 0
    tm.tiles[0].collision = true
    expect(tm.getTileCollision(0, 0)).toBe(true)
    tm.tiles[0].collision = false
    expect(tm.getTileCollision(0, 0)).toBe(false)
  })
})