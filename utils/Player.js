import { Entity } from './Entity'

export class Player extends Entity {
  constructor(screenWidth, screenHeight, tileSize, id = null) {
    super()
    this.imagesLoaded = false
    this.isInCollision = false;
    // Add player ID for multiplayer
    this.id = id
    this.name = `Player-${id || 'local'}`
    this.x = 100
    this.y = 100
    this.speed = 4
    this.direction = 'down'
    this.hasPerson = 0
    this.tileSize = tileSize
    this.isLocal = !id // Local player
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.tileSize = tileSize

    // Custom collision area for player
    this.solidArea = {
      x: 10,
      y: 10,
      width: 45,
      height: 60
    }
    this.solidAreaDefaultX = this.solidArea.x
    this.solidAreaDefaultY = this.solidArea.y

    this.lastUpdate = Date.now()
    this.needsUpdate = false
    this.images = {};
  }

  async loadImages() {
    const imagePromises = [
      { key: 'up', path: '/player/aliUp.png' },
      { key: 'down', path: '/player/down.png' },
      { key: 'left', path: '/player/AlimentadorIzq.png' },
      { key: 'right', path: '/player/AlimentadorDer.png' },
      { key: 'upLoadedTwo', path: '/player/TransmiUp.png' },
      { key: 'downLoadedTwo', path: '/player/TransmiDown.png' },
      { key: 'leftLoadedTwo', path: '/player/TransmiIzq.png' },
      { key: 'rightLoadedTwo', path: '/player/TransmiDer.png' },
      { key: 'upLoaded', path: '/player/SitpUp.png' },
      { key: 'downLoaded', path: '/player/SitpDown.png' },
      { key: 'leftLoaded', path: '/player/SitpIzq.png' },
      { key: 'rightLoaded', path: '/player/SitpDer.png' }
    ];

    // Load images in parallel
    try {
      await Promise.all(
        imagePromises.map(async ({ key, path }) => {
          const img = new Image();
          img.src = path;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          this.images[key] = img;
        })
      );
      this.imagesLoaded = true;
      console.log('Images loaded successfully for player:', this.id);
    } catch (error) {
      console.error('Error loading images for player:', this.id, error);
    }
  }

  draw(ctx) {
    if (!this.imagesLoaded) {
      this.loadImages().catch(console.error);
      return;
    }

    try {
      const currentImage = this.getCurrentImage();
      if (!currentImage) {
        console.warn('No image available for direction:', this.direction);
        return;
      }

      // Save context state
      ctx.save();

      // Draw player sprite
      ctx.drawImage(currentImage, this.x, this.y, this.tileSize, this.tileSize);

      // Draw debug outline for remote players
      if (!this.isLocal) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.strokeRect(this.x, this.y, this.tileSize, this.tileSize);
      }

      // Draw player name with background
      ctx.font = '12px Arial';
      const nameText = this.isLocal ? `${this.name} (You)` : this.name;
      const textWidth = ctx.measureText(nameText).width;

      // Name background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        this.x + this.tileSize / 2 - textWidth / 2 - 2,
        this.y - 20,
        textWidth + 4,
        16
      );

      // Name text
      ctx.fillStyle = this.isLocal ? '#00ff00' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(nameText, this.x + this.tileSize / 2, this.y - 8);

      // Draw person count if needed
      if (this.hasPerson > 0) {
        this.drawPersonCount(ctx);
      }

      // Restore context state
      ctx.restore();
    } catch (error) {
      console.error('Error drawing player:', error, this);
    }
  }

  updateFromNetwork(data) {
    if (this.isLocal) return;

    try {
      // Direct update for smoother movement
      if (data.x !== undefined) {
        this.x = Number(data.x);
        this.y = Number(data.y);
        this.direction = data.direction;
        this.hasPerson = Number(data.hasPerson || 0);
        return;
      }

      // Handle positions broadcast
      if (data.type === 'positions' && data.players) {
        const playerData = data.players[this.id];
        if (playerData) {
          this.x = Number(playerData.x);
          this.y = Number(playerData.y);
          this.direction = playerData.direction;
          this.hasPerson = Number(playerData.hasPerson || 0);
        }
      }
    } catch (error) {
      console.error('Error updating player from network:', error);
    }
  }

  getCurrentImage() {
    if (!this.images || !this.direction) return null;

    const directionKey = this.direction.toLowerCase();
    if (this.hasPerson >= 5) {
      return this.images[`${directionKey}LoadedTwo`] || this.images[directionKey];
    } else if (this.hasPerson >= 3) {
      return this.images[`${directionKey}Loaded`] || this.images[directionKey];
    }
    return this.images[directionKey];
  }

  drawPersonCount(ctx) {
    // Background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x + this.tileSize - 5, this.y - 5, 7, 0, Math.PI * 2);
    ctx.fill();

    // Indicator circle
    ctx.fillStyle = this.hasPerson >= 5 ? '#ff0000' : '#ffff00';
    ctx.beginPath();
    ctx.arc(this.x + this.tileSize - 5, this.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Count number
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.hasPerson.toString(),
      this.x + this.tileSize - 5,
      this.y - 3
    );
  }

  update(keys, collisionChecker, objects, webSocket = null, otherPlayers = []) {
    if (!this.isLocal) return;

    const oldX = this.x;
    const oldY = this.y;
    const oldDirection = this.direction;
    const oldHasPerson = this.hasPerson;

    this.collisionOn = false;
    let keyPressed = false;

    // Comprobar teclas y establecer dirección
    if (keys.up) {
      this.direction = 'up';
      keyPressed = true;
    } else if (keys.down) {
      this.direction = 'down';
      keyPressed = true;
    } else if (keys.left) {
      this.direction = 'left';
      keyPressed = true;
    } else if (keys.right) {
      this.direction = 'right';
      keyPressed = true;
    }

    // Si se presionó una tecla, actualizar posición
    if (keyPressed) {
      // Comprobar colisiones con tiles
      collisionChecker.checkTile(this);

      // Comprobar colisiones con otros jugadores
      const hasPlayerCollision = this.checkPlayerCollision(otherPlayers, webSocket);

      // Comprobar colisiones con objetos
      const objIndex = collisionChecker.checkObject(this, objects, true);
      if (objIndex !== 999) {
        this.pickUpObject(objIndex, objects, webSocket);
      }

      // Mover si no hay colisión
      if (!this.collisionOn && !hasPlayerCollision) {
        switch (this.direction) {
          case 'up':
            this.y -= this.speed;
            break;
          case 'down':
            this.y += this.speed;
            break;
          case 'left':
            this.x -= this.speed;
            break;
          case 'right':
            this.x += this.speed;
            break;
        }
      }

      // Mantener dentro de los límites de la pantalla
      this.x = Math.max(0, Math.min(this.x, this.screenWidth - this.tileSize));
      this.y = Math.max(0, Math.min(this.y, this.screenHeight - this.tileSize));
    }

    // Check if state needs network update
    this.needsUpdate = oldX !== this.x ||
      oldY !== this.y ||
      oldDirection !== this.direction ||
      oldHasPerson !== this.hasPerson;

    if (this.needsUpdate) {
      this.lastUpdate = Date.now();
    }

    return this.needsUpdate;
  }

  updateFromNetwork(data) {
    if (this.isLocal) return;

    try {
      if (data.type === 'positions' && data.players) {
        const playerData = data.players[this.id];
        if (playerData) {
          // Interpolación suave de movimiento
          const targetX = Number(playerData.x);
          const targetY = Number(playerData.y);

          // Usar interpolación para movimiento más suave
          const lerpFactor = 0.3;
          this.x = this.x + (targetX - this.x) * lerpFactor;
          this.y = this.y + (targetY - this.y) * lerpFactor;

          // Actualizar dirección y puntaje inmediatamente
          this.direction = playerData.direction;
          this.hasPerson = Number(playerData.hasPerson || 0);

          // Marcar para redibujar
          this.needsUpdate = true;
        }
        this.getCurrentImage();
      }
    } catch (error) {
      console.error('Error updating player from network:', error);
    }
  }

  // Add method to get network state
  getNetworkState() {
    return {
      id: this.id,
      x: Math.round(this.x),
      y: Math.round(this.y),
      direction: this.direction,
      hasPerson: this.hasPerson,
      name: this.name,
      timestamp: Date.now()
    };
  }

  // Add this method after getNetworkState()
  checkPlayerCollision(otherPlayers, webSocket) {
    let collisionOccurred = false;

    for (const player of otherPlayers) {
      if (player && player.id !== this.id) {
        // Calculate boundaries for both players
        const myLeft = this.x + this.solidArea.x;
        const myRight = this.x + this.solidArea.x + this.solidArea.width;
        const myTop = this.y + this.solidArea.y;
        const myBottom = this.y + this.solidArea.y + this.solidArea.height;

        const otherLeft = player.x + player.solidArea.x;
        const otherRight = player.x + player.solidArea.x + player.solidArea.width;
        const otherTop = player.y + player.solidArea.y;
        const otherBottom = player.y + player.solidArea.y + player.solidArea.height;

        // Check for overlap
        if (myRight > otherLeft &&
          myLeft < otherRight &&
          myBottom > otherTop &&
          myTop < otherBottom) {

          if (!this.isInCollision) {
            // Aplicar penalización
            this.hasPerson = Math.max(1, this.hasPerson - 3);

            // Marcar colisión
            this.isInCollision = true;

            // Reset después de 1 segundo
            setTimeout(() => {
              this.isInCollision = false;
            }, 1000);

            // Actualizar servidor
            if (webSocket) {
              webSocket.sendHasPersonUpdate(this.hasPerson);
            }
          }

          // Aplicar rebote
          const pushDistance = 30;
          this.x += (myLeft < otherLeft) ? -pushDistance : pushDistance;
          this.y += (myTop < otherTop) ? -pushDistance : pushDistance;

          return true;
        }
      }
    }
  }
  pickUpObject(index, objects, webSocket = null) {
    if (index !== 999 && objects[index]) {
      const oldHasPerson = this.hasPerson;
      const object = objects[index];

      if (object.name === 'person' && object.active !== false) {
        // Incrementar contador de pasajeros
        this.hasPerson++;

        // Guardar posición original del pasajero
        const originalPosition = {
          x: object.x,
          y: object.y,
          id: object.id || `p${index}` // Ensure person has an ID
        };

        // Actualizar ID si no existe
        if (!object.id) {
          object.id = originalPosition.id;
        }

        // Desactivar el pasajero temporalmente
        object.active = false;

        // Notificar cambios al servidor
        if (webSocket) {
          webSocket.sendHasPersonUpdate(this.hasPerson);
          webSocket.sendPersonState(originalPosition.id, false);
          console.log(`Person ${originalPosition.id} deactivated`);
        }
        console.log(`Pasajero recogido: ${originalPosition.id}`);
        console.log(`Pasajero recogido por: ${this.name}`);

        // Programar reaparición del pasajero
        setTimeout(() => {
          if (objects[index]) {
            objects[index].active = true;
            if (webSocket) {
              webSocket.sendPersonState(originalPosition.id, true);
              console.log(`Person ${originalPosition.id} reactivated`);
            }
          }
        }, 5000);

        // Log para debugging
        console.log('Person pickup:', {
          personId: originalPosition.id,
          position: `${originalPosition.x},${originalPosition.y}`,
          playerHasPerson: this.hasPerson
        });

      } else if (object.name === 'obstacles') {
        this.hasPerson = Math.max(1, this.hasPerson - 3);
        if (webSocket) {
          webSocket.sendHasPersonUpdate(this.hasPerson);
        }
      }

      if (oldHasPerson !== this.hasPerson) {
        console.log('HasPerson changed:', {
          old: oldHasPerson,
          new: this.hasPerson,
          objectId: object.id
        });
      }
    }
  }
}
