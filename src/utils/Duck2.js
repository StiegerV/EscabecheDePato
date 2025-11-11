import Duck from '../utils/Duck.js';
export default class Duck2 extends Duck {
  constructor(scene, x, y, baseSpeed) {
    super(scene, x, y, baseSpeed);
    
    // propiedades del escudo
    this.hitsRequired = 2;
    this.hitsTaken = 0;
    this.hasShield = true;
    
    // crear overlay de escudo 
    this.shieldOverlay = scene.add.circle(this.x, this.y, this.width * 0.7, 0xffffff, 0.3)
      .setStrokeStyle(3, 0xffffff);
    this.shieldOverlay.setDepth(this.depth - 1);
    
    // efecto de  arcoiris
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

  // generar color del arcoiris basado en un valor entre 0 y 1
  getRainbowColor(value) {
    const r = Math.floor(127 + 127 * Math.sin(value * Math.PI * 2));
    const g = Math.floor(127 + 127 * Math.sin(value * Math.PI * 2 + Math.PI * 2/3));
    const b = Math.floor(127 + 127 * Math.sin(value * Math.PI * 2 + Math.PI * 4/3));
    return (r << 16) + (g << 8) + b;
  }

  // sobrescribir el metodo hit para manejar el escudo
  hit() {
    if (this.isDead) return;
    
    this.hitsTaken++;
    
    // efecto visual de golpe al escudo
    this.scene.tweens.add({
      targets: [this, this.shieldOverlay],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Bounce.out'
    });
    
    if (this.hitsTaken < this.hitsRequired) {
      // primer golpe tankea el escudo
      this.showShieldHitEffect();
    } else {
      // segundo golpe - escudo destruido, pato muere
      this.destroyShield();
      super.hit(); // llamar al metodo original de muerte
    }
  }

  // efecto visual cuando el escudo recibe un golpe
  showShieldHitEffect() {
    // flash blanco
    this.scene.tweens.add({
      targets: this.shieldOverlay,
      alpha: 0.8,
      duration: 50,
      yoyo: true
    });
    
    // this.scene.sound.play('shield-hit', { volume: 0.3 });
  }

  // destruir el escudo
  destroyShield() {
    this.hasShield = false;
    this.setData('isShielded', false);
    
    // efecto de explosion del escudo
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
    
    // detener el efecto arcoiris
    if (this.rainbowTween) {
      this.rainbowTween.stop();
      this.rainbowTween = null;
    }
    
    // remover el tint
    this.clearTint();
    
    // this.scene.sound.play('shield-break', { volume: 0.5 });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // actualizar posicion del escudo junto con el pato
    if (this.shieldOverlay && this.shieldOverlay.active) {
      this.shieldOverlay.setPosition(this.x, this.y);
    }
  }

  // sobrescribir destroy para limpiar recursos
  destroy() {
    // Limpiar el escudo si existe
    if (this.shieldOverlay) {
      this.shieldOverlay.destroy();
    }
    
    // detener el tween del arcoiris
    if (this.rainbowTween) {
      this.rainbowTween.stop();
    }
    
    super.destroy();
  }
}