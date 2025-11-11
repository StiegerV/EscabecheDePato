import Duck from './Duck.js';

class Duck3 extends Duck {
  constructor(scene, x, y, baseSpeed) {
    super(scene, x, y, baseSpeed);
    
    // propiedades para movimiento aleatorio
    this.directionChangeTimer = 0;
    this.directionChangeInterval = Phaser.Math.Between(800, 2000);
    this.currentSpeed = baseSpeed;
    
    // apariencia gris oscuro
    this.setTint(0x333333);
    
    // iniciar con movimiento aleatorio después de que el cuerpo esté listo
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.setRandomMovement();
      }
    });
  }

  setRandomMovement() {
    // verificar que el pato este activo antes de modificar
    if (!this.active || !this.body) return;
    
    // movimiento completamente aleatorio
    const angle = Phaser.Math.Between(0, 360);
    const speed = Phaser.Math.Between(this.currentSpeed * 0.6, this.currentSpeed * 1.4);
    
    const rad = Phaser.Math.DegToRad(angle);
    const velX = Math.cos(rad) * speed;
    const velY = Math.sin(rad) * speed;
    
    this.setVelocity(velX, velY);
    this.setFlipX(velX < 0);
  }

  zigZagMovement() {
    // verificar que el pato este activo antes de modificar
    if (!this.active || !this.body) return;
    
    // movimiento en zig-zag seguro para evitar el crash
    let currentVelX = 0;
    let currentVelY = 0;
    
    if (this.body && this.body.velocity) {
      currentVelX = this.body.velocity.x;
      currentVelY = this.body.velocity.y;
    }
    
    // añadir variacion aleatoria
    const variationX = Phaser.Math.Between(-40, 40);
    const variationY = Phaser.Math.Between(-40, 40);
    
    const newVelX = currentVelX + variationX;
    const newVelY = currentVelY + variationY;
    
    this.setVelocity(newVelX, newVelY);
    this.setFlipX(newVelX < 0);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // verificar que el pato este activo antes de hacer cualquier cosa
    if (!this.active) return;
    
    this.directionChangeTimer += delta;
    
    // cambiar direccion periodicamente
    if (this.directionChangeTimer >= this.directionChangeInterval) {
      this.setRandomMovement();
      this.directionChangeTimer = 0;
      this.directionChangeInterval = Phaser.Math.Between(500, 1500);
    }
    
    // movimiento en zig-zag ocasional 30% de probabilidad
    if (Phaser.Math.Between(1, 100) <= 30) {
      this.zigZagMovement();
    }
  }

  hit() {
    if (this.isDead) return;
    
    // comportamiento normal al ser golpeado
    super.hit();
  }
}

export default Duck3;