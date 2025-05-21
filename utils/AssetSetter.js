import { ObjPerson } from './ObjPerson'
import { ObjObstacles } from './ObjObstacles'

export class AssetSetter {
  constructor(tileSize) {
    this.tileSize = tileSize
    this.objects = new Array(15).fill(null)
    this.personImages = {
      p1: 'PersonaCorbata.png',
      p2: 'PersonaNaranja.png',
      p3: 'mujer.png',
      p4: 'mujer1.png',
      p5: 'personaCampesino.png',
      p6: 'personaEstudiante.png',
      p7: 'personaVerde.png',
      p8: 'tombo.png',
      p9: 'tombo1.png',
      p10:'personaVerde.png',
      p11:'tombo1.png',
      p12:'mujer.png',
      p13:'personaEstudiante.png',
      p14:'personaCampesino.png',
      p15:'mujer1.png',
    }
  }

  async setObjects(serverData = null) {
    // Configuración de obstáculos

    const personSetup = serverData ? this.processServerData(serverData) : []

    const obstaclesSetup = [
      { file: 'huecos.png', x: 6, y: 6 },
      { file: 'motoEnElPiso.png', x: 3, y: 3 },
      { file: 'senal.png', x: 9, y: 11 },
      { file: 'senal1.png', x: 9, y: 10 },
      { file: 'senal2.png', x: 8, y: 9 },
      { file: 'senal3.png', x: 9, y: 9 }
    ]

    const loadPromises = []

    personSetup.forEach((setup, index) => {
      this.objects[index] = new ObjPerson(setup.file)
      this.objects[index].x = setup.x * this.tileSize
      this.objects[index].y = setup.y * this.tileSize
      this.objects[index].id = setup.id
      this.objects[index].active = true // Establecer estado activo
      loadPromises.push(this.objects[index].loadImage(setup.file))
    })

    obstaclesSetup.forEach((setup, index) => {
      const objIndex = index + personSetup.length
      this.objects[objIndex] = new ObjObstacles(setup.file)
      this.objects[objIndex].x = setup.x * this.tileSize
      this.objects[objIndex].y = setup.y * this.tileSize
      loadPromises.push(this.objects[objIndex].loadImage(setup.file))
    })

    await Promise.all(loadPromises)
    console.log('All images loaded')
    console.log('Objects:', this.objects)
    return this.objects

  }

  processServerData(serverData) {
    if (!serverData.persons || serverData.type !== 'availablePersons') {
      console.error('Invalid server data format')
      return []
    }

    console.log('Server data:', serverData)
    console.log('Server data persons:', serverData.persons)

    return Object.entries(serverData.persons).map(([id, person]) => ({
      file: this.personImages[id],
      x: person.x,
      y: person.y,
      id: person.id
    }))

  }
}