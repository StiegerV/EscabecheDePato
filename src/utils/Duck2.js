import Duck from '../utils/Duck.js';
export default class Duck2 extends Duck {
  constructor(scene, x, y, baseSpeed) {
    super(scene, x, y, baseSpeed);
    
    // Propiedades del escudo
    this.hitsRequired = 2;
    this.hitsTaken = 0;
    this.hasShield = true;
    
    // Crear overlay de escudo (círculo alrededor del pato)
    this.shieldOverlay = scene.add.circle(this.x, this.y, this.width * 0.7, 0xffffff, 0.3)
      .setStrokeStyle(3, 0xffffff);
    this.shieldOverlay.setDepth(this.depth - 1);
    
    // Efecto de tint arcoíris
    this.rainbowTween = scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      repeat: -1, // repetir infinitamente
      onUpdate: (tween) => {
        const value = tween.getValue();
        const color = this.getRainbowColor(value);
        this.setTint(color);
        this.shieldOverlay.setStrokeStyle(3, color);
      }
    });
    
    // Actualizar posición del escudo junto con el pato
    this.setData('isShielded', true);
  }

  // Generar color del arcoíris basado en un valor entre 0 y 1
  getRainbowColor(value) {
    const r = Math.floor(127 + 127 * Math.sin(value * Math.PI * 2));
    const g = Math.floor(127 + 127 * Math.sin(value * Math.PI * 2 + Math.PI * 2/3));
    const b = Math.floor(127 + 127 * Math.sin(value * Math.PI * 2 + Math.PI * 4/3));
    return (r << 16) + (g << 8) + b;
  }

  // Sobrescribir el método hit para manejar el escudo
  hit() {
    if (this.isDead) return;
    
    this.hitsTaken++;
    
    // Efecto visual de golpe al escudo
    this.scene.tweens.add({
      targets: [this, this.shieldOverlay],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Bounce.out'
    });
    
    if (this.hitsTaken < this.hitsRequired) {
      // Primer golpe - escudo aún activo
      this.showShieldHitEffect();
    } else {
      // Segundo golpe - escudo destruido, pato muere
      this.destroyShield();
      super.hit(); // Llamar al método original de muerte
    }
  }

  // Efecto visual cuando el escudo recibe un golpe
  showShieldHitEffect() {
    // Flash blanco
    this.scene.tweens.add({
      targets: this.shieldOverlay,
      alpha: 0.8,
      duration: 50,
      yoyo: true
    });
    
    // Sonido de golpe al escudo (opcional)
    // this.scene.sound.play('shield-hit', { volume: 0.3 });
  }

  // Destruir el escudo
  destroyShield() {
    this.hasShield = false;
    this.setData('isShielded', false);
    
    // Efecto de explosión del escudo
    if (this.shieldOverlay) {
      this.scene.tweens.add({
        targets: this.shieldOverlay,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.shieldOverlay.destroy();
          this.shieldOverlay = null;
        }
      });
    }
    
    // Detener el efecto arcoíris
    if (this.rainbowTween) {
      this.rainbowTween.stop();
      this.rainbowTween = null;
    }
    
    // Remover el tint
    this.clearTint();
    
    // Sonido de escudo destruido (opcional)
    // this.scene.sound.play('shield-break', { volume: 0.5 });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // Actualizar posición del escudo junto con el pato
    if (this.shieldOverlay && this.shieldOverlay.active) {
      this.shieldOverlay.setPosition(this.x, this.y);
    }
  }

  // Sobrescribir destroy para limpiar recursos
  destroy() {
    // Limpiar el escudo si existe
    if (this.shieldOverlay) {
      this.shieldOverlay.destroy();
    }
    
    // Detener el tween del arcoíris
    if (this.rainbowTween) {
      this.rainbowTween.stop();
    }
    
    super.destroy();
  }
}