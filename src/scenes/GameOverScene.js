export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.stats = data.stats || { score: 0, hits: 0, tiempo: 0 };
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Música de game over
    this.music = this.sound.add('gameover', { volume: 0.5 });
    this.music.play();

    // Fondo oscuro semitransparente
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Título
    this.add.text(width / 2, height / 2 - 150, '🎯 GAME OVER 🎯', {
      fontSize: '56px',
      fill: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Estadísticas
    const textStyle = {
      fontSize: '26px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    };

    this.add.text(width / 2, height / 2 - 40, `Puntos: ${this.stats.score}`, textStyle).setOrigin(0.5);
    this.add.text(width / 2, height / 2, `Aciertos: ${this.stats.hits}`, textStyle).setOrigin(0.5);

    // Botón o texto para reiniciar
    this.restartText = this.add.text(width / 2, height / 2 + 150, 'Presiona ESPACIO para reiniciar', {
      fontSize: '22px',
      fill: '#ffff00'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.restartText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Reiniciar con tecla ESPACIO
    this.input.keyboard.once('keydown-SPACE', () => {
      this.music.stop();
      this.scene.start('Level1'); // 👈 reinicia desde el primer nivel
    });
  }

  shutdown() {
    if (this.music) {
      this.music.stop();
    }
  }
}
