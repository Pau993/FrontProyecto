import { describe, it, expect, vi, beforeEach } from 'vitest'

// ← Mocks primero y las clases definidas DENTRO del callback de cada vi.mock
vi.mock('./ObjPerson', () => ({
  ObjPerson: class {
    constructor(file) {
      this.file = file;
      this.x = 0; this.y = 0; this.id = null; this.active = false;
      this.loadImage = vi.fn(() => Promise.resolve('person image loaded'));
    }
  }
}));

vi.mock('./ObjObstacles', () => ({
  ObjObstacles: class {
    constructor(file) {
      this.file = file;
      this.x = 0; this.y = 0;
      this.loadImage = vi.fn(() => Promise.resolve('obstacle image loaded'));
    }
  }
}));

import { AssetSetter } from './AssetSetter';

// Tests TODO dentro del describe
describe('AssetSetter', () => {
  let assetSetter, tileSize;

  beforeEach(() => {
    tileSize = 32;
    assetSetter = new AssetSetter(tileSize);
  });

  it('inicializa correctamente', () => {
    expect(assetSetter.tileSize).toBe(tileSize)
    expect(assetSetter.objects.length).toBe(15)
    expect(assetSetter.objects.every(obj => obj === null)).toBe(true)
    expect(assetSetter.personImages).toHaveProperty('p1')
    expect(typeof assetSetter.setObjects).toBe('function')
  })

  it('setObjects sin serverData crea los obstáculos y llama a loadImage', async () => {
    const objs = await assetSetter.setObjects()
    // 6 obstáculos iniciales (sin personas)
    expect(objs.filter(obj => obj && obj.file && obj.loadImage).length).toBe(6)
    objs.forEach(obj => {
      if (obj && obj.file && obj.loadImage) {
        expect(obj.loadImage).toHaveBeenCalledOnce()
      }
    })
    // Las posiciones están correctamente calculadas
    expect(objs[0].x).toBe(6 * tileSize)
    expect(objs[0].y).toBe(6 * tileSize)
  })

  it('setObjects con serverData crea personas y obstáculos con loadImage', async () => {
    const serverData = {
      type: 'availablePersons',
      persons: {
        p1: { x: 1, y: 2, id: 'a1' },
        p3: { x: 4, y: 5, id: 'a2' }
      }
    }
    const objs = await assetSetter.setObjects(serverData)
    // 2 personas primero, luego 6 obstáculos
    expect(objs[0]).toBeTruthy()
    expect(objs[1]).toBeTruthy()
    expect(objs[2]).toBeTruthy()
    // Personas cargadas correctamente
    expect(objs[0].file).toBe('PersonaCorbata.png')
    expect(objs[0].x).toBe(1 * tileSize)
    expect(objs[0].y).toBe(2 * tileSize)
    expect(objs[0].id).toBe('a1')
    expect(objs[0].active).toBe(true)
    // loadImage llamado en todas
    objs.slice(0,2).forEach(obj => expect(obj.loadImage).toHaveBeenCalledOnce())
    objs.slice(2,8).forEach(obj => expect(obj.loadImage).toHaveBeenCalledOnce())
    // El resto hasta 15 es null
    expect(objs.slice(8).every(o => o===null)).toBe(true)
  })

  it('processServerData devuelve [] si el tipo es inválido', () => {
    const withWrongType = assetSetter.processServerData({type: 'other', persons: {}})
    expect(withWrongType).toEqual([])
    const withoutPersons = assetSetter.processServerData({type: 'availablePersons'})
    expect(withoutPersons).toEqual([])
  })

  it('processServerData asigna bien los archivos', () => {
    const data = {
      type: 'availablePersons',
      persons: {p7: {x: 1, y: 2, id: 'p777'}}
    }
    const res = assetSetter.processServerData(data)
    expect(res[0].file).toBe('personaVerde.png')
    expect(res[0].x).toBe(1)
    expect(res[0].y).toBe(2)
    expect(res[0].id).toBe('p777')
  })

  it('setObjects maneja llamadas o errores inesperados', async () => {
    // Si personSetup es vacío, sólo obstáculos
    const data = {type: 'availablePersons', persons: {}}
    const objs = await assetSetter.setObjects(data)
    expect(objs.filter(obj => obj && obj.file && obj.loadImage).length).toBe(6)
    // Comprueba que no lanza error
  })
})