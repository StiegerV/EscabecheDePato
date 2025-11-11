import Duck from '../utils/Duck.js';
import ScoreManager from '../utils/Score.js';
import LevelManager from '../utils/LevelManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const levelCfg = LevelManager.config();

    this.add.image(400, 300, 'background');
    this.crosshair = this.add.image(400, 300, 'crosshair').setScale(0.2);
    this.crosshair.setDepth(10);

    this.animations();

    this.ducks = this.add.group();

    this.time.addEvent({
      delay: levelCfg.spawnDelay,
      callback: () => {
        const duck = new Duck(
          this,
          Phaser.Math.Between(100, 700),
          550,
          levelCfg.duckSpeed
        );
        this.ducks.add(duck);
      },
      loop: true
    });

    this.input.on('pointermove', (p) => this.crosshair.setPosition(p.x, p.y));
    this.input.on('pointerdown', (p) => this.handleShot(p));

    this.scoreText = this.add.text(10, 10, 'Puntos: 0', { fontSize: '24px', fill: '#fff' });
    this.levelText = this.add.text(10, 40, 'Nivel: ' + LevelManager.get(), { fontSize: '24px', fill: '#fff' });
  }

  handleShot(p) {
    this.sound.play('shot', { volume: 0.1 });
    this.ducks.getChildren().forEach(d => {
      if (d.getBounds().contains(p.x, p.y)) {
        this.sound.play('hit', { volume: 0.2 });
        d.destroy();
        ScoreManager.add(100);
      }
    });
  }

  animations() {
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('duck', { start: 0, end: 3 }),
      frameRate: 15,
      repeat: -1,
    });
  }

  update() {
    this.scoreText.setText('Puntos: ' + ScoreManager.get());

    const levelCfg = LevelManager.config();
    if (ScoreManager.get() >= levelCfg.targetScore) {
      LevelManager.next();
      this.scene.restart(); // reinicia con la nueva dificultad
    }

    this.levelText.setText('Nivel: ' + LevelManager.get());
  }
}
