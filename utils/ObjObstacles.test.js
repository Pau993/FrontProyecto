import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ObjObstacles } from './ObjObstacles'

// Mock SuperObject si es necesario (NO obligatorio si es una clase base vacía)
// class SuperObject {} // Si reporta error de import puedes sustituir así

// Mock global de Image
global.Image = class {
  constructor() { 
    this.src = ''
    // Simular onload async
    setTimeout(() => { if (this.onload) this.onload(); }, 0) 
  }
}

describe('ObjObstacles', () => {
  let obj

  beforeEach(() => {
    obj = new ObjObstacles('tree.png')
  })

  it('inicializa correctamente los valores', () => {
    expect(obj.name).toBe('obstacles')
    expect(obj.collision).toBe(false)
    expect(obj.image).toBeInstanceOf(Image)
    expect(obj.image.src).toContain('/objects/tree.png')
  })

  it('loadImage carga una imagen y resuelve', async () => {
    const result = obj.loadImage('rock.png')
    expect(obj.image).toBeInstanceOf(Image)
    expect(obj.image.src).toContain('/objects/rock.png')
    await expect(result).resolves.toBeUndefined() // la promesa resuelve sin valor
  })
})