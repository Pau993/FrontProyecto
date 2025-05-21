import { describe, it, expect, beforeEach } from 'vitest'
import { ObjPerson } from './ObjPerson'

// Mock global Image para entornos Node/tests
global.Image = class {
  constructor() {
    this.src = ''
    setTimeout(() => { if (this.onload) this.onload(); }, 0)
  }
}

describe('ObjPerson', () => {
  let obj

  beforeEach(() => {
    obj = new ObjPerson('avatar.png')
  })

  it('inicializa correctamente los valores', () => {
    expect(obj.name).toBe('person')
    expect(obj.active).toBe(true)
    expect(obj.image).toBeInstanceOf(Image)
    expect(obj.image.src).toContain('/person/avatar.png')
  })

  it('loadImage carga la imagen y resuelve', async () => {
    const result = obj.loadImage('otra-imagen.png')
    expect(obj.image).toBeInstanceOf(Image)
    expect(obj.image.src).toContain('/person/otra-imagen.png')
    await expect(result).resolves.toBeUndefined()
  })
})