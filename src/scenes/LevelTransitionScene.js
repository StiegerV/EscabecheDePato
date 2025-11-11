export default class LevelTransitionScene extends Phaser.Scene {
  constructor() {
    super('LevelTransitionScene');
  }

  init(data) {
    this.levelNumber = data.levelNumber || 1;
    this.nextScene = data.nextScene || 'MenuScene';
    this.stats = data.stats || {};
  }

  create() {
    // fondo semitransparente
    this.add.rectangle(0, 0, window.innerWidth, window.innerHeight, 0x000000, 0.8).setOrigin(0);

    // titulo
    this.add.text(window.innerWidth / 2, 150, `Nivel ${this.levelNumber} completado`, {
      fontSize: '48px',
      fill: '#ffcc00'
    }).setOrigin(0.5);

    // estadisticas
    const { hits = 0, shots = 0, accuracy = 0, timeLeft = 0 } = this.stats;

    // tomar score del registry para mantener acumulativo
    const score = this.registry.get('score') ?? 0;

    const statsText = `
Puntaje total: ${score}
Patos acertados: ${hits}
Disparos realizados: ${shots}
Precisión: ${accuracy.toFixed(1)}%
Tiempo restante: ${timeLeft} segundos
    `;

    this.add.text(window.innerWidth / 2, window.innerHeight / 2 - 50, statsText, {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // texto de continuacion
    const continueText = this.add.text(window.innerWidth / 2, window.innerHeight - 120, 'Click para continuar', {
      fontSize: '26px',
      fill: '#aaa'
    }).setOrigin(0.5);

    // animacion suave
    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 600
    });

    // esperar clic o tecla para continuar
    this.input.once('pointerdown', () => this.scene.start(this.nextScene));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start(this.nextScene));
  }
}
