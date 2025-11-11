export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HudScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    // 🔹 Crear textos primero
    this.scoreText = this.add.text(20, 20, '', { fontSize: '24px', fill: '#000' });
    this.hitsText = this.add.text(20, 50, '', { fontSize: '24px', fill: '#000' });
    this.ammoText = this.add.text(20, 80, '', { fontSize: '24px', fill: '#000' });
    this.timerText = this.add.text(20, 110, '', { fontSize: '24px', fill: '#000' });

    // Inicializar textos con valores actuales del registry
    this.updateData(null, 'score', this.registry.get('score') ?? 0);
    this.updateData(null, 'hits', this.registry.get('hits') ?? 0);
    this.updateData(null, 'ammo', this.registry.get('ammo') ?? 5);
    this.updateData(null, 'tiempo', this.registry.get('tiempo') ?? 0);

    // 🔹 Listener después de crear los textos
    this.registry.events.on('changedata', (parent, key, value) => {
      this.updateData(parent, key, value);
    }, this);
  }

  updateData(parent, key, data) {
    switch (key) {
      case 'score':
        if (this.scoreText) this.scoreText.setText(`Puntos: ${data}`);
        break;
      case 'hits':
        if (this.hitsText) this.hitsText.setText(`Aciertos: ${data}`);
        break;
      case 'ammo':
        if (this.ammoText) this.ammoText.setText(`Balas: ${data}`);
        break;
      case 'tiempo':
        if (this.timerText) this.timerText.setText(`Tiempo: ${data}`);
        break;
    }
  }
}
