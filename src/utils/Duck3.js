import Duck from './Duck.js';

class Duck3 extends Duck {
  constructor(scene, x, y, baseSpeed) {
    super(scene, x, y, baseSpeed);
    
    // Propiedades para movimiento impredecible
    this.directionChangeTimer = 0;
    this.directionChangeInterval = Phaser.Math.Between(800, 2000);
    this.currentSpeed = baseSpeed;
    this.evasionDistance = 150; // Distancia a la que empieza a evadir
    this.evasionCooldown = 0;
    
    // Apariencia gris oscuro
    this.setTint(0x333333); // Gris oscuro
    
    // Iniciar con movimiento aleatorio
    this.setRandomMovement();
  }

  setRandomMovement() {
    // Movimiento completamente aleatorio
    const angle = Phaser.Math.Between(0, 360);
    const speed = Phaser.Math.Between(this.currentSpeed * 0.6, this.currentSpeed * 1.4);
    
    const rad = Phaser.Math.DegToRad(angle);
    const velX = Math.cos(rad) * speed;
    const velY = Math.sin(rad) * speed;
    
    this.setVelocity(velX, velY);
    this.setFlipX(velX < 0);
  }

  zigZagMovement() {
    // Movimiento en zig-zag suave
    const currentVelX = this.body.velocity.x;
    const currentVelY = this.body.velocity.y;
    
    // Añadir variación aleatoria a la velocidad actual
    const variationX = Phaser.Math.Between(-50, 50);
    const variationY = Phaser.Math.Between(-50, 50);
    
    this.setVelocity(currentVelX + variationX, currentVelY + variationY);
    this.setFlipX(this.body.velocity.x < 0);
  }

  evadeCrosshair() {
    if (this.evasionCooldown > 0) return;
    
    // Calcular ángulo para huir del cursor
    const angleToCrosshair = Phaser.Math.Angle.Between(
      this.scene.crosshair.x, this.scene.crosshair.y, this.x, this.y
    );
    
    // Velocidad de evasión (más rápida que la normal)
    const evadeSpeed = this.currentSpeed * 1.3;
    const evadeX = Math.cos(angleToCrosshair) * evadeSpeed;
    const evadeY = Math.sin(angleToCrosshair) * evadeSpeed;
    
    this.setVelocity(evadeX, evadeY);
    this.setFlipX(evadeX < 0);
    
    // Efecto visual de evasión
    this.setTint(0x666666); // Gris más claro durante la evasión
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true
    });
    
    // Cooldown para evitar cambios demasiado bruscos
    this.evasionCooldown = 300;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // Actualizar cooldown
    if (this.evasionCooldown > 0) {
      this.evasionCooldown -= delta;
      if (this.evasionCooldown <= 0) {
        this.setTint(0x333333); // Volver al gris oscuro
      }
    }
    
    this.directionChangeTimer += delta;
    
    // Cambiar dirección periódicamente
    if (this.directionChangeTimer >= this.directionChangeInterval) {
      this.setRandomMovement();
      this.directionChangeTimer = 0;
      this.directionChangeInterval = Phaser.Math.Between(500, 1500);
    }
    
    // Movimiento en zig-zag ocasional (25% de probabilidad)
    if (Phaser.Math.Between(1, 100) <= 25) {
      this.zigZagMovement();
    }
    
    // Comportamiento evasivo cuando el cursor está cerca
    const distanceToCrosshair = Phaser.Math.Distance.Between(
      this.x, this.y, 
      this.scene.crosshair.x, this.scene.crosshair.y
    );
    
    if (distanceToCrosshair < this.evasionDistance && this.evasionCooldown <= 0) {
      this.evadeCrosshair();
    }
  }

  // Sobrescribir el método hit para comportamiento único
  hit() {
    if (this.isDead) return;
    
    // 20% de probabilidad de esquivar el disparo cambiando dirección bruscamente
    if (Phaser.Math.Between(1, 100) <= 20) {
      this.evadeHit();
      return; // No muere, solo evade
    }
    
    // Si no evade, entonces muere normalmente
    super.hit();
  }

  evadeHit() {
    // Cambio brusco de dirección al esquivar
    const evadeAngle = Phaser.Math.Between(0, 360);
    const evadeSpeed = this.currentSpeed * 1.5;
    
    const rad = Phaser.Math.DegToRad(evadeAngle);
    const evadeX = Math.cos(rad) * evadeSpeed;
    const evadeY = Math.sin(rad) * evadeSpeed;
    
    this.setVelocity(evadeX, evadeY);
    this.setFlipX(evadeX < 0);
    
    // Efecto visual de esquivar
    this.setTint(0x888888); // Gris medio al esquivar
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    });
    
    // Cooldown después de esquivar
    this.evasionCooldown = 500;
  }
}

export default Duck3;