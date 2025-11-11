export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.ammo = 5;
    this.hits = 0;
    this.shots = 0;
    this.isReloading = false;
    this.manualReloadReady = true;

    this.scene.registry.set('ammo', this.ammo);
    this.scene.registry.set('hits', this.hits);
    if (!this.scene.registry.has('score')) this.scene.registry.set('score', 0); // inicializa si no existe

    this.scene.input.on('pointerdown', (p) => this.shoot(p));
    this.scene.input.keyboard.on('keydown-R', () => this.handleBolt());
  }

  shoot(pointer) {
    if (this.isReloading || !this.manualReloadReady) return;

    if (this.ammo > 0) {
      this.shots++;
      this.ammo--;
      this.scene.registry.set('ammo', this.ammo);
      this.scene.sound.play('shot', { volume: 0.09 });
      this.scene.cameras.main.shake(50, 0.002);
      this.manualReloadReady = false;

      let hitSomething = false;

      this.scene.ducks.getChildren().forEach(d => {
        if (Phaser.Geom.Rectangle.Contains(d.getBounds(), pointer.x, pointer.y)) {
          d.hit();
          this.scene.sound.play('hit', { volume: 0.4 });
          this.hits++;

          // 🔹 Actualizar score directamente en el registry
          const currentScore = this.scene.registry.get('score') || 0;
          const newScore = currentScore + 100;
          this.scene.registry.set('score', newScore);

          this.scene.registry.set('hits', this.hits);
          console.log(`[Player] Hit! Score actualizado: ${newScore}`);
          hitSomething = true;
        }
      });

      if (this.ammo === 0) this.startReload();
    }
  }

  handleBolt() {
    if (!this.manualReloadReady && !this.isReloading) {
      this.scene.sound.play('bolt', { volume: 0.1 });
      this.manualReloadReady = true;
    } else if (this.ammo < 5 && !this.isReloading) {
      this.startReload();
    }
  }

  startReload() {
    this.isReloading = true;
    this.scene.sound.play('reload', { volume: 0.3 });

    this.scene.time.delayedCall(2000, () => {
      this.ammo = 5;
      this.isReloading = false;
      this.manualReloadReady = true;
      this.scene.registry.set('ammo', this.ammo);
    });
  }
}
