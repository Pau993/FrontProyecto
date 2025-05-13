export class CollisionChecker {
  constructor(tileSize, tileManager) {
    this.tileSize = tileSize
    this.tileManager = tileManager
  }

  checkTile(entity) {
    const entityLeft = entity.x + entity.solidArea.x
    const entityRight = entity.x + entity.solidArea.x + entity.solidArea.width
    const entityTop = entity.y + entity.solidArea.y
    const entityBottom = entity.y + entity.solidArea.y + entity.solidArea.height

    const entityLeftCol = Math.floor(entityLeft / this.tileSize)
    const entityRightCol = Math.floor(entityRight / this.tileSize)
    const entityTopRow = Math.floor(entityTop / this.tileSize)
    const entityBottomRow = Math.floor(entityBottom / this.tileSize)

    let tileNum1, tileNum2

    switch (entity.direction) {
      case 'up':
        const nextTopRow = Math.floor((entityTop - entity.speed) / this.tileSize)
        tileNum1 = this.tileManager.tileMap[entityLeftCol][nextTopRow]
        tileNum2 = this.tileManager.tileMap[entityRightCol][nextTopRow]
        if (this.tileManager.tiles[tileNum1]?.collision ||
          this.tileManager.tiles[tileNum2]?.collision) {
          entity.collisionOn = true
        }
        break
      case 'down':
        const nextBottomRow = Math.floor((entityBottom + entity.speed) / this.tileSize)
        tileNum1 = this.tileManager.tileMap[entityLeftCol][nextBottomRow]
        tileNum2 = this.tileManager.tileMap[entityRightCol][nextBottomRow]
        if (this.tileManager.tiles[tileNum1]?.collision ||
          this.tileManager.tiles[tileNum2]?.collision) {
          entity.collisionOn = true
        }
        break
      case 'left':
        const nextLeftCol = Math.floor((entityLeft - entity.speed) / this.tileSize)
        tileNum1 = this.tileManager.tileMap[nextLeftCol][entityTopRow]
        tileNum2 = this.tileManager.tileMap[nextLeftCol][entityBottomRow]
        if (this.tileManager.tiles[tileNum1]?.collision ||
          this.tileManager.tiles[tileNum2]?.collision) {
          entity.collisionOn = true
        }
        break
      case 'right':
        const nextRightCol = Math.floor((entityRight + entity.speed) / this.tileSize)
        tileNum1 = this.tileManager.tileMap[nextRightCol][entityTopRow]
        tileNum2 = this.tileManager.tileMap[nextRightCol][entityBottomRow]
        if (this.tileManager.tiles[tileNum1]?.collision ||
          this.tileManager.tiles[tileNum2]?.collision) {
          entity.collisionOn = true
        }
        break
    }
  }

  checkObject(entity, objects, player = false, webSocket = null) {
    let index = 999

    objects.forEach((obj, i) => {
      if (!obj) return

      // Get entity solid area coordinates
      const entityArea = {
        x: entity.x + entity.solidArea.x,
        y: entity.y + entity.solidArea.y,
        width: entity.solidArea.width,
        height: entity.solidArea.height
      }

      // Get object solid area coordinates
      const objArea = {
        x: obj.x + (obj.solidArea?.x || 0),
        y: obj.y + (obj.solidArea?.y || 0),
        width: obj.solidArea?.width || this.tileSize,
        height: obj.solidArea?.height || this.tileSize
      }

      // Check collision based on direction
      switch (entity.direction) {
        case 'up':
          entityArea.y -= entity.speed
          break
        case 'down':
          entityArea.y += entity.speed
          break
        case 'left':
          entityArea.x -= entity.speed
          break
        case 'right':
          entityArea.x += entity.speed
          break
      }

      // Check if rectangles intersect
      if (this.checkIntersect(entityArea, objArea)) {
        if (obj.collision) {
          entity.collisionOn = true
        }
        if (player) {
          index = i
        }
        if (player && webSocket && webSocket.isConnected) {
          entity.hasPerson = !entity.hasPerson
          webSocket.sendHasPersonUpdate(entity.hasPerson)
        }
      }
    })

    return index
  }

  checkIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
  }

  checkPlayerCollision(entity, players) {
    for (const player of players) {
      if (!player || player.id === entity.id) continue;

      // Get entity's next position
      const entityNextArea = {
        x: entity.x + entity.solidArea.x,
        y: entity.y + entity.solidArea.y,
        width: entity.solidArea.width,
        height: entity.solidArea.height
      };

      // Adjust next position based on direction and speed
      switch (entity.direction) {
        case 'up':
          entityNextArea.y -= entity.speed;
          break;
        case 'down':
          entityNextArea.y += entity.speed;
          break;
        case 'left':
          entityNextArea.x -= entity.speed;
          break;
        case 'right':
          entityNextArea.x += entity.speed;
          break;
      }

      // Get other player's area
      const playerArea = {
        x: player.x + player.solidArea.x,
        y: player.y + player.solidArea.y,
        width: player.solidArea.width,
        height: player.solidArea.height
      };

      // Check collision
      if (this.checkIntersect(entityNextArea, playerArea)) {
        entity.collisionOn = true;
        return true;
      }
    }
    return false;
  }
}